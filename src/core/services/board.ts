import { createService, Service } from "../../utils/system/service";
import Rect from "../data/geometry/rect";
import { BoardItem } from "../data/item";
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

    // TODO: Find a better name since items are not necessarily added to a single chunk
    private addToChunk(items : Iterable<BoardItem>) : void {
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

    private removeFromChunk(items : Iterable<BoardItem>) : void {
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

    private truncateRegion(r : Rect) : Rect {
        return new Rect(
            Math.floor(r.x / Chunk.maxChunkSize),
            Math.floor(r.y / Chunk.maxChunkSize),
            Math.floor(r.w / Chunk.maxChunkSize),
            Math.floor(r.h / Chunk.maxChunkSize),
        );
    }

    private hash(x : number, y : number) : string {
        return `${x}_${y}`;
    }
}

export const board = createService<BoardState, Board>(Board);
