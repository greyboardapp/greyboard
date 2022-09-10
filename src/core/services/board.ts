import { createService, Service } from "../../utils/system/service";
import Point from "../data/geometry/point";
import { BoardItem } from "../data/item";
import { Chunk } from "./board/chunk";

interface BoardState {
    name : string;
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

    start() : void {}

    add(items : Iterable<BoardItem>) : void {
        for (const item of items)
            this.items.set(item.id, item);
        this.addToChunk(items);
    }

    private addToChunk(items : Iterable<BoardItem>) : void {
        for (const item of items) {
            const min = this.getChunkIndex(item.rect.x, item.rect.y);
            const max = this.getChunkIndex(item.rect.x2, item.rect.y2);
            for (let { x } = min; x <= max.x; ++x)
                for (let { y } = min; y <= max.y; ++y) {
                    const key = this.hash(x, y);
                    let chunk = this.chunks.get(key);
                    if (!chunk) {
                        chunk = new Chunk(x, y);
                        this.chunks.set(key, chunk);
                    }
                    chunk.add(item);
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
                        chunk.remove(item);
                }
        }
    }

    // getItemsFromRegion(region : MinMaxRect) : Set<BoardItem> {
    //     const items = new Set<BoardItem>();
    //     for (let { x } = region.min; x <= region.max.x; ++x)
    //         for (let { y } = region.min; y <= region.max.y; ++y) {
    //             const key = this.hash(x, y);
    //             const cell = this.cells.get(key);
    //             if (cell)
    //                 for (const item of cell.values())
    //                     items.add(item);
    //         }
    //     return items;
    // }

    private getChunkIndex(x : number, y : number) : Point {
        return new Point(Math.floor(x / Chunk.maxChunkSize), Math.floor(y / Chunk.maxChunkSize));
    }

    private hash(x : number, y : number) : string {
        return `${x}_${y}`;
    }
}

export const board = createService<BoardState, Board>(Board);
