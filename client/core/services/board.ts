import { batch } from "solid-js";
import { BoardData } from "../../models/board";
import { BoardSaveData } from "../../../common/models/board";
import { ByteBuffer } from "../../utils/datatypes/byteBuffer";
import createDelegate from "../../utils/datatypes/delegate";
import { floor } from "../../utils/math/math";
import { loadImage } from "../../utils/system/image";
import { createService, Service } from "../../utils/system/service";
import Point, { PressurePoint } from "../data/geometry/point";
import Rect from "../data/geometry/rect";
import { BoardItem, BoardItemType, BoardShapeItem } from "../data/item";
import Ellipse from "../data/items/ellipse";
import Image from "../data/items/image";
import Path from "../data/items/path";
import Rectangle from "../data/items/rectangle";
import { createAction } from "./actions";
import { Chunk } from "./board/chunk";
import { QuadTree } from "./board/quadTree";
import { builder } from "./builder";
import { viewport } from "./viewport";
import { network } from "./network";
import { selection } from "./selection";
import { BoardMoveData, BoardResizeData } from "../data/boardAction";

interface BoardState {
    id : string;
    name : string;
    author : string;
    slug : string;

    // NOTE: properties in this state will change once collaboration will be implemented.
    isPublic : boolean;
    lastBuildScale : number;
    temporaryScale : number;
    savingEnabled : boolean;
    lastSaveDate ?: Date;
}

export class Board extends Service<BoardState> {
    public readonly items = new Map<number, BoardItem>();
    public readonly chunks = new Map<string, Chunk>();

    public readonly addAction = createAction(
        (items : BoardItem[]) => {
            this.add(items);
            network.addBoardItems(items);
        },
        (items : BoardItem[]) => {
            this.remove(items);
            network.removeBoardItems(items);
        },
    );

    public readonly removeAction = createAction(
        (items : BoardItem[]) => {
            this.remove(items);
            network.removeBoardItems(items);
        },
        (items : BoardItem[]) => {
            this.add(items);
            network.addBoardItems(items);
        },
    );

    public readonly moveAction = createAction(
        (data : BoardMoveData, execute ?: boolean) => {
            if (execute)
                this.move(data.ids, data.dx, data.dy);
            network.moveBoardItems(data.ids, data.dx, data.dy);
            selection.refresh();
        },
        (data : BoardMoveData, execute ?: boolean) => {
            if (execute)
                this.move(data.ids, -data.dx, -data.dy);
            network.moveBoardItems(data.ids, -data.dx, -data.dy);
            selection.refresh();
        },
    );

    public readonly resizeAction = createAction(
        (data : BoardResizeData, execute ?: boolean) => {
            if (execute)
                this.resize(data.ids, data.newRect);
            network.resizeBoardItems(data.ids, data.newRect);
            selection.refresh();
        },
        (data : BoardResizeData, execute ?: boolean) => {
            if (execute)
                this.resize(data.ids, data.oldRect);
            network.resizeBoardItems(data.ids, data.oldRect);
            selection.refresh();
        },
    );

    public readonly bringForwardAction = createAction(
        (items : BoardItem[]) => this.bringForward(items),
        (items : BoardItem[]) => this.sendBackward(items),
    );

    public readonly sendBackwardAction = createAction(
        (items : BoardItem[]) => this.sendBackward(items),
        (items : BoardItem[]) => this.bringForward(items),
    );

    public readonly setLockStateAction = createAction(
        (data : { items : BoardItem[]; state : boolean}) => this.setLockState(data.items, data.state),
        (data : { items : BoardItem[]; state : boolean}) => this.setLockState(data.items, !data.state),
    );

    public readonly onBoardReadyToSave = createDelegate<[data : BoardSaveData]>();

    private saveTimer : number | null = null;

    constructor() {
        super({
            id: "",
            name: "New Board",
            author: "",
            slug: "",
            isPublic: false,
            lastBuildScale: 1,
            temporaryScale: 1,
            savingEnabled: false,
        });
    }

    start() : void {
        this.stop();
        viewport.onZoom.add(this.rebuildAsync);
        builder.onBuildFinished.add(this.rebuildFinished);
    }

    stop() : void {
        this.items.clear();
        this.chunks.forEach((chunk) => chunk.dispose());
        this.chunks.clear();
        if (this.saveTimer)
            clearInterval(this.saveTimer);
        batch(() => {
            this.state.savingEnabled = false;
            this.state.temporaryScale = this.state.lastBuildScale = 1;
        });
        this.onBoardReadyToSave.clear();
    }

    save() : BoardSaveData {
        const data : BoardSaveData = {
            id: this.state.id,
            name: this.state.name,
            contents: this.serialize(),
        };
        this.onBoardReadyToSave(data);
        network.boardSaved();
        return data;
    }

    startPeriodicSave() : void {
        this.state.savingEnabled = true;
        if (this.saveTimer)
            clearInterval(this.saveTimer);
        this.saveTimer = setInterval(() => this.save(), (import.meta.env.BOARD_SAVE_INTERVAL ?? 10) * 1000, null);
    }

    async loadFromBoardData(data : BoardData) : Promise<void> {
        batch(() => {
            this.state.id = data.id;
            this.state.name = data.name;
            this.state.author = data.author;
            this.state.slug = data.slug;
            this.state.isPublic = data.isPublic;
        });
        const buffer = ByteBuffer.fromArrayBuffer(data.contents);
        const items = await this.deserialize(buffer);
        this.add(items);
    }

    add(items : Iterable<BoardItem>) : void {
        for (const item of items)
            this.items.set(item.id, item);
        this.addToChunk(items);
    }

    addFromObject(items : Iterable<BoardItem>) : void {
        this.add(Array.from(items).map((item) : (BoardItem | null) => {
            let created : BoardItem | null = null;
            if (item.type === BoardItemType.Path) {
                created = new Path((item as Path).points.map((point) => new Point(point.x, point.y)), (item as Path).color, (item as Path).weight);
                created.rect = new Rect(item.rect.x, item.rect.y, Math.abs(item.rect.x2 - item.rect.x), Math.abs(item.rect.y2 - item.rect.y));
            } else if (item.type === BoardItemType.Rectangle) {
                created = new Rectangle(new Rect(item.rect.x, item.rect.y, Math.abs(item.rect.x2 - item.rect.x), Math.abs(item.rect.y2 - item.rect.y)), (item as Rectangle).color, (item as Rectangle).weight, (item as Rectangle).filled);
            } else if (item.type === BoardItemType.Ellipse) {
                created = new Ellipse(new Rect(item.rect.x, item.rect.y, Math.abs(item.rect.x2 - item.rect.x), Math.abs(item.rect.y2 - item.rect.y)), (item as Ellipse).color, (item as Ellipse).weight, (item as Ellipse).filled);
            }

            if (created)
                created.id = item.id;

            return created;
        }).filter((item) => item !== null) as Iterable<BoardItem>);
    }

    remove(items : Iterable<BoardItem>) : void {
        for (const item of items)
            this.items.delete(item.id);
        this.removeFromChunk(items);
    }

    removeByIds(ids : Iterable<number>) : void {
        this.removeFromChunk(this.getItemsFromIds(ids));
    }

    move(ids : Iterable<number>, dx : number, dy : number) : void {
        const items = this.getItemsFromIds(ids);

        this.removeFromChunk(items);
        for (const item of items) {
            item.rect.x += dx;
            item.rect.x2 += dx;
            item.rect.y += dy;
            item.rect.y2 += dy;
        }
        this.addToChunk(items);
    }

    resize(ids : Iterable<number>, rect : Rect) : void {
        const items = this.getItemsFromIds(ids);
        console.log(items, rect);

        this.removeFromChunk(items);
        const bb = this.getItemsBoundingBox(items);
        for (const item of items) {
            item.rect.x = rect.x + ((item.rect.x - bb.x) / bb.w) * rect.w;
            item.rect.y = rect.y + ((item.rect.y - bb.y) / bb.h) * rect.h;
            item.rect.x2 = rect.x + ((item.rect.x2 - bb.x) / bb.w) * rect.w;
            item.rect.y2 = rect.y + ((item.rect.y2 - bb.y) / bb.h) * rect.h;
        }
        this.addToChunk(items);
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
            chunk.qt.deleteAll();
        }
        this.addToChunk(this.items.values());
    }

    rebuildAsync() : void {
        if (builder.isRunning)
            builder.cancel();

        this.state.temporaryScale = viewport.state.scale / this.state.lastBuildScale;
        builder.queueBuild(Array.from(this.items.values()));
    }

    getItemsWithinRect(rect : Rect) : BoardItem[] {
        const items : BoardItem[] = [];
        const region = this.truncateRegion(rect);
        for (let { x } = region.min; x <= region.max.x; ++x)
            for (let { y } = region.min; y <= region.max.y; ++y) {
                const key = this.hash(x, y);
                const chunk = this.chunks.get(key);
                if (chunk)
                    items.push(...chunk.qt.get(rect));
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

    async deserialize(buffer : ByteBuffer) : Promise<BoardItem[]> {
        const items : BoardItem[] = [];
        while (!buffer.eod)
            try {
                const id = buffer.readUInt();
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
                } else if (type === BoardItemType.Image) {
                    const src = buffer.readString();
                    const image = await loadImage(src);
                    item = new Image(rect, image);
                } else {
                    continue;
                }

                if (item) {
                    item.id = id;
                    item.locked = locked === 1;
                    item.zIndex = zIndex;
                    item.label = label.length === 0 ? null : label;
                    items.push(item);
                }
            } catch (e) {
                console.error(e);
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

    getItemsBoundingBox(items ?: Iterable<BoardItem>) : Rect {
        const rect = Rect.invertedInfinite();
        for (const item of items ?? this.items.values())
            rect.append(item.rect);
        return rect;
    }

    getItemsFromIds(ids : Iterable<number>) : BoardItem[] {
        const items : BoardItem[] = [];

        for (const id of ids) {
            const item = this.items.get(id);
            if (item)
                items.push(item);
        }

        return items;
    }

    private rebuildFinished(chunks : Map<string, QuadTree>) : void {
        for (const chunk of this.chunks.values()) {
            chunk.resetGraphics();
            chunk.qt.deleteAll();
        }

        for (const [key, qt] of chunks) {
            let chunk = this.chunks.get(key);
            if (chunk) {
                chunk.qt = qt;
            } else {
                const [x, y] = key.split("_").map((part) => parseInt(part));
                chunk = Chunk.fromQuadTree(x, y, qt);
                this.chunks.set(key, chunk);
            }
            chunk.rerender();
        }

        batch(() => {
            this.state.temporaryScale = 1;
            this.state.lastBuildScale = viewport.state.scale;
        });
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
