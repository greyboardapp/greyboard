import { ByteBuffer } from "../../utils/datatypes/byteBuffer";
import { floor } from "../../utils/math/math";
import { createService, Service } from "../../utils/system/service";
import Point, { PressurePoint } from "../data/geometry/point";
import Rect from "../data/geometry/rect";
import { BoardItem, BoardItemType, BoardShapeItem } from "../data/item";
import Ellipse from "../data/items/ellipse";
import Path from "../data/items/path";
import Rectangle from "../data/items/rectangle";
import { createAction } from "./actions";
import { Chunk } from "./board/chunk";
import { viewport } from "./viewport";

interface BoardState {
    name : string;

    // NOTE: properties in this state will change once collaboration will be implemented.
    isPublic : boolean;
}

export class Board extends Service<BoardState> {
    public readonly items = new Map<number, BoardItem>();
    public readonly chunks = new Map<string, Chunk>();

    public readonly addAction = createAction(
        (items : Iterable<BoardItem>) => this.add(items),
        (items : Iterable<BoardItem>) => this.remove(items),
    );

    public readonly removeAction = createAction(
        (items : Iterable<BoardItem>) => this.remove(items),
        (items : Iterable<BoardItem>) => this.add(items),
    );

    public readonly bringForwardAction = createAction(
        (items : Iterable<BoardItem>) => this.bringForward(items),
        (items : Iterable<BoardItem>) => this.sendBackward(items),
    );

    public readonly sendBackwardAction = createAction(
        (items : Iterable<BoardItem>) => this.sendBackward(items),
        (items : Iterable<BoardItem>) => this.bringForward(items),
    );

    public readonly setLockStateAction = createAction(
        (data : { items : Iterable<BoardItem>; state : boolean}) => this.setLockState(data.items, data.state),
        (data : { items : Iterable<BoardItem>; state : boolean}) => this.setLockState(data.items, !data.state),
    );

    constructor() {
        super({
            name: "New Board",
            isPublic: false,
        });
    }

    start() : void {
        // HACK: For now this solution works, but to increase performance move only affected items between chunks
        viewport.onZoom.add(this.rebuild);
    }

    add(items : Iterable<BoardItem>) : void {
        for (const item of items)
            this.items.set(item.id, item);
        this.addToChunk(items);
    }

    remove(items : Iterable<BoardItem>) : void {
        for (const item of items)
            this.items.delete(item.id);
        this.removeFromChunk(items);
    }

    removeByIds(ids : Iterable<number>) : void {
        const items : BoardItem[] = [];

        for (const id of ids) {
            const item = this.items.get(id);
            if (item)
                items.push(item);
        }

        this.removeFromChunk(items);
    }

    bringForward(items : Iterable<BoardItem>) : void {
        for (const item of items)
            if (item.zIndex < 255)
                item.zIndex++;
        this.updateItems(items);
    }

    sendBackward(items : Iterable<BoardItem>) : void {
        for (const item of items)
            if (item.zIndex > 0)
                item.zIndex--;
        this.updateItems(items);
    }

    setLockState(items : Iterable<BoardItem>, state : boolean) : void {
        for (const item of items)
            item.locked = state;
    }

    setLabel(items : Iterable<BoardItem>, label : string | null) : void {
        for (const item of items)
            item.label = label;
    }

    setColor(items : Iterable<BoardItem>, color : number) : void {
        for (const item of items)
            if (item instanceof BoardShapeItem)
                item.color = color;
        // NOTE: Filter items based on if they are BoardShapeItems. It could reduce the region that needs to be updated.
        this.updateItems(items);
    }

    setWeight(items : Iterable<BoardItem>, weight : number) : void {
        for (const item of items)
            if (item instanceof BoardShapeItem)
                item.weight = weight;
        // NOTE: Filter items based on if they are BoardShapeItems. It could reduce the region that needs to be updated.
        this.updateItems(items);
    }

    rebuild() : void {
        for (const chunk of this.chunks.values()) {
            chunk.resetGraphics();
            chunk.deleteAll();
        }
        this.addToChunk(this.items.values());
    }

    getItemsWithinRect(rect : Rect) : BoardItem[] {
        const items : BoardItem[] = [];
        const region = this.truncateRegion(rect);
        for (let { x } = region.min; x <= region.max.x; ++x)
            for (let { y } = region.min; y <= region.max.y; ++y) {
                const key = this.hash(x, y);
                const chunk = this.chunks.get(key);
                if (chunk)
                    items.push(...chunk.get(rect));
            }
        return items;
    }

    getItemsAtPoint(p : Point) : BoardItem[] {
        return this.getItemsWithinRect(new Rect(p.x, p.y, 1, 1));
    }

    serialize(items ?: Iterable<BoardItem>) : ByteBuffer {
        const itemsToSerialize = Array.from(items ?? this.items.values());
        const buffer = new ByteBuffer(itemsToSerialize.reduce((len, item) => len + item.getSerializedSize(), 0));
        for (const item of itemsToSerialize)
            item.serialize(buffer);
        return buffer;
    }

    deserialize(buffer : ByteBuffer) : BoardItem[] {
        const items : BoardItem[] = [];
        while (!buffer.eod) {
            const [type, locked, zIndex] = buffer.readFormatted("bbb");
            const label = buffer.readString();
            const rect = new Rect(...buffer.readFormatted("ffff"));
            let item : BoardItem;

            if (type === BoardItemType.Path) {
                const [color, weight] = buffer.readFormatted("ib");
                const count = buffer.readUInt();
                const points : PressurePoint[] = [];
                for (let i = 0; i < count; i++)
                    points.push(new PressurePoint(...buffer.readFormatted("fff")));
                item = new Path(points, color, weight);
                item.rect = rect;
            } else if (type === BoardItemType.Rectangle) {
                const [color, weight] = buffer.readFormatted("ib");
                const filled = buffer.readByte();
                item = new Rectangle(rect, color, weight, filled === 1);
            } else if (type === BoardItemType.Ellipse) {
                const [color, weight] = buffer.readFormatted("ib");
                const filled = buffer.readByte();
                item = new Ellipse(rect, color, weight, filled === 1);
            } else {
                continue;
            }

            if (item) {
                item.locked = locked === 1;
                item.zIndex = zIndex;
                item.label = label;
                items.push(item);
            }
        }
        return items;
    }

    // TODO: Find a better name since items are not necessarily added to a single chunk
    addToChunk(items : Iterable<BoardItem>) : void {
        for (const item of items) {
            const region = this.truncateRegion(viewport.viewportToBoardRect(item.rect));
            for (let { x } = region.min; x <= region.max.x; ++x)
                for (let { y } = region.min; y <= region.max.y; ++y) {
                    const key = this.hash(x, y);
                    let chunk = this.chunks.get(key);
                    if (!chunk) {
                        chunk = new Chunk(x, y);
                        this.chunks.set(key, chunk);
                    }
                    chunk.insert(item);
                }
        }
    }

    removeFromChunk(items : Iterable<BoardItem>) : void {
        for (const item of items) {
            const region = this.truncateRegion(viewport.viewportToBoardRect(item.rect));
            for (let { x } = region.min; x <= region.max.x; ++x)
                for (let { y } = region.min; y <= region.max.y; ++y) {
                    const key = this.hash(x, y);
                    const chunk = this.chunks.get(key);
                    // HACK: For now this works but in the future let's implement this so that the deleteMany function can be used effectively
                    if (chunk)
                        chunk.deleteMany([item]);
                }
        }
    }

    private updateItems(items : Iterable<BoardItem>) : void {
        const bb = Rect.invertedInfinite();
        for (const item of items)
            bb.append(item.rect);

        for (const item of items) {
            const region = this.truncateRegion(viewport.viewportToBoardRect(item.rect));
            for (let { x } = region.min; x <= region.max.x; ++x)
                for (let { y } = region.min; y <= region.max.y; ++y) {
                    const key = this.hash(x, y);
                    const chunk = this.chunks.get(key);
                    if (chunk)
                        chunk.updateRegion(bb);
                }
        }
    }

    private truncateRegion(r : Rect) : Rect {
        const rect = new Rect(
            floor(r.x / Chunk.maxChunkSize),
            floor(r.y / Chunk.maxChunkSize),
            0, 0,
        );
        rect.x2 = floor(r.x2 / Chunk.maxChunkSize);
        rect.y2 = floor(r.y2 / Chunk.maxChunkSize);
        return rect;
    }

    private hash(x : number, y : number) : string {
        return `${x}_${y}`;
    }
}

export const board = createService<BoardState, Board>(Board);
