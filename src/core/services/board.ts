import { Injectable, Lifetime, Service } from "../../utils/system/di";
import Point from "../data/geometry/point";
import { MinMaxRect } from "../data/geometry/rect";
import { BoardItem } from "../data/item";
import { StaticRenderer } from "./graphics/renderer";

@Injectable(Lifetime.Singleton)
export default class Board extends Service {
    public static readonly cellSize = 100;

    public items = new Map<number, BoardItem>();
    public readonly cells = new Map<string, Set<BoardItem>>();

    private renderer : StaticRenderer;

    constructor() {
        super();
    }

    start() : void {
        this.renderer = new StaticRenderer(this);
    }

    add(items : Iterable<BoardItem>) : void {
        for (const item of items)
            this.items.set(item.id, item);
        this.addToGrid(items);
        this.renderer.add(items);
    }

    remove(ids : Iterable<number>) : void {
        const items : BoardItem[] = [];
        const region = new MinMaxRect();
        for (const id of ids) {
            const item = this.items.get(id);
            if (item) {
                items.push(item);
                region.append(item.cell);
                this.items.delete(id);
            }
        }
        this.removeFromGrid(items);
        this.renderer.updateRegion(region);
    }

    getItemsFromRegion(region : MinMaxRect) : Set<BoardItem> {
        const items = new Set<BoardItem>();
        for (let { x } = region.min; x <= region.max.x; ++x)
            for (let { y } = region.min; y <= region.max.y; ++y) {
                const key = this.hash(x, y);
                const cell = this.cells.get(key);
                if (cell)
                    for (const item of cell.values())
                        items.add(item);
            }
        return items;
    }

    private addToGrid(items : Iterable<BoardItem>) : void {
        for (const item of items) {
            const min = this.getCellIndex(item.rect.x, item.rect.y);
            const max = this.getCellIndex(item.rect.x + item.rect.w, item.rect.y + item.rect.h);
            for (let { x } = min; x <= max.x; ++x)
                for (let { y } = min; y <= max.y; ++y) {
                    const key = this.hash(x, y);
                    let cell = this.cells.get(key);
                    if (!cell) {
                        cell = new Set();
                        this.cells.set(key, cell);
                    }
                    cell.add(item);
                }
            item.cell.min = min;
            item.cell.max = max;
        }
    }

    private removeFromGrid(items : Iterable<BoardItem>) : void {
        for (const item of items) {
            const { min, max } = item.cell;
            for (let { x } = min; x <= max.x; ++x)
                for (let { y } = min; y <= max.y; ++y) {
                    const key = this.hash(x, y);
                    const cell = this.cells.get(key);
                    if (cell)
                        cell.delete(item);
                }
        }
    }

    private getCellIndex(x : number, y : number) : Point {
        return new Point(Math.floor(x / Board.cellSize), Math.floor(y / Board.cellSize));
    }

    private hash(x : number, y : number) : string {
        return `${x}_${y}`;
    }
}
