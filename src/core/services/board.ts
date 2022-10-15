import { createService, Service } from "../../utils/system/service";
import { BoardItem } from "../data/item";
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

    rebuild() : void {
        for (const chunk of this.chunks.values()) {
            chunk.resetGraphics();
            chunk.deleteAll();
        }
        this.addToChunk(this.items.values());
    }

    // TODO: Find a better name since items are not necessarily added to a single chunk
    private addToChunk(items : Iterable<BoardItem>) : void {
        for (const item of items) {
            const minX = this.truncateCoordinate(item.transform.x);
            const minY = this.truncateCoordinate(item.transform.y);
            const maxX = this.truncateCoordinate(item.transform.x2);
            const maxY = this.truncateCoordinate(item.transform.y2);
            for (let x = minX; x <= maxX; ++x)
                for (let y = minY; y <= maxY; ++y) {
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
            const { min, max } = item.cell;
            for (let { x } = min; x <= max.x; ++x)
                for (let { y } = min; y <= max.y; ++y) {
                    const key = this.hash(x, y);
                    const chunk = this.chunks.get(key);
                    if (chunk)
                        chunk.delete(item);
                }
        }
    }

    private truncateCoordinate(x : number) : number {
        return Math.floor(x / Chunk.maxChunkSize);
    }

    private hash(x : number, y : number) : string {
        return `${x}_${y}`;
    }
}

export const board = createService<BoardState, Board>(Board);
