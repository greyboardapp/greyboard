import { px } from "../../../utils/dom/dom";
import { generateId } from "../../../utils/datatypes/id";
import { getOperatingSystem, OperatingSystem } from "../../../utils/system/system";
import Rect from "../../data/geometry/rect";
import { BoardItem } from "../../data/item";
import { board } from "../board";
import Graphics from "../renderer/graphics";
import { viewport } from "../viewport";

export type QuadTreeSubdivisions = [QuadTree, QuadTree, QuadTree, QuadTree] | [];

export class QuadTree {
    public static readonly maxCapacity = 10;
    public static readonly maxDepth = 10;

    public items = new Set<BoardItem>();
    public children : QuadTreeSubdivisions = [];

    constructor(public boundary : Rect, private readonly depth = 0) {}

    insert(item : BoardItem) : void {
        const bb = viewport.viewportToBoardRect(item.rect);
        if (!bb.intersects(this.boundary))
            return;

        if (this.items.size < QuadTree.maxCapacity || this.depth >= QuadTree.maxDepth) {
            this.items.add(item);
        } else {
            if (this.children.length === 0)
                this.subdivide();
            for (const child of this.children)
                child.insert(item);
        }
    }

    delete(item : BoardItem) : void {
        const bb = viewport.viewportToBoardRect(item.rect);
        if (!bb.intersects(this.boundary))
            return;

        for (const i of this.items)
            if (item === i) {
                this.items.delete(i);
                return;
            }

        for (const child of this.children)
            child.delete(item);
    }

    deleteAll() : void {
        this.items.clear();
        for (const child of this.children)
            child.deleteAll();
    }

    get(region : Rect, result ?: Set<BoardItem>) : Set<BoardItem> {
        if (!result)
            result = new Set<BoardItem>();

        if (!region.intersects(this.boundary))
            return result;

        for (const child of this.children)
            child.get(region, result);

        for (const item of this.items) {
            const bb = viewport.viewportToBoardRect(item.rect);
            if (bb.intersects(region))
                result.add(item);
        }

        return result;
    }

    getAll(result ?: Set<BoardItem>) : Set<BoardItem> {
        if (!result)
            result = new Set<BoardItem>();

        for (const child of this.children)
            child.getAll(result);

        for (const item of this.items)
            result.add(item);

        return result;
    }

    subdivide() : void {
        this.children = [
            new QuadTree(new Rect(this.boundary.x, this.boundary.y, this.boundary.w / 2, this.boundary.h / 2), this.depth + 1),
            new QuadTree(new Rect(this.boundary.x + this.boundary.w / 2, this.boundary.y, this.boundary.w / 2, this.boundary.h / 2), this.depth + 1),
            new QuadTree(new Rect(this.boundary.x + this.boundary.w / 2, this.boundary.y + this.boundary.h / 2, this.boundary.w / 2, this.boundary.h / 2), this.depth + 1),
            new QuadTree(new Rect(this.boundary.x, this.boundary.y + this.boundary.h / 2, this.boundary.w / 2, this.boundary.h / 2), this.depth + 1),
        ];

        for (const child of this.children)
            for (const item of this.items)
                child.insert(item);

        this.items.clear();
    }
}

export class Chunk extends QuadTree {
    public static maxChunkSize = getOperatingSystem() === OperatingSystem.Windows ? 10000 : 2000;

    public id = generateId();
    public canvas : HTMLCanvasElement;
    public graphics : Graphics;

    constructor(public x : number, public y : number) {
        super(new Rect(x * Chunk.maxChunkSize, y * Chunk.maxChunkSize, Chunk.maxChunkSize, Chunk.maxChunkSize), 0);
        this.canvas = <canvas
            width={Chunk.maxChunkSize}
            height={Chunk.maxChunkSize}
            style={{
                left: px(this.boundary.x),
                top: px(this.boundary.y),
                width: px(this.boundary.w),
                height: px(this.boundary.h),
            }}
        ></canvas> as HTMLCanvasElement;
        document.getElementById("staticCanvasContainer")?.append(this.canvas);
        this.graphics = new Graphics(this.canvas);
        this.resetGraphics();
    }

    get key() : string { return `${this.x}_${this.y}`; }

    insert(item : BoardItem) : void {
        super.insert(item);
        item.render(this.graphics, false);
    }

    deleteMany(items : Iterable<BoardItem>) : void {
        const bb = Rect.invertedInfinite();
        for (const item of items) {
            this.delete(item);
            bb.append(item.rect);
        }

        bb.inflate(15);

        this.graphics.scissor(bb.x, bb.y, bb.w, bb.h, () => {
            for (const item of board.getItemsWithinRect(viewport.viewportToBoardRect(bb)))
                item.render(this.graphics, false);
        });
    }

    resetGraphics() : void {
        this.graphics.clear();
        this.graphics.origin(this.x * Chunk.maxChunkSize, this.y * Chunk.maxChunkSize);
        this.graphics.zoom(viewport.state.scale);
    }
}
