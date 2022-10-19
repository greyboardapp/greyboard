import { px } from "../../../utils/dom";
import { generateId } from "../../../utils/system/id";
import Point from "../../data/geometry/point";
import Rect, { MinMaxRect } from "../../data/geometry/rect";
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
        if (!item.transform.intersects(this.boundary))
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
        if (!item.transform.intersects(this.boundary))
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

        if (this.children.length > 0) {
            for (const child of this.children)
                child.get(region, result);
            return result;
        }

        for (const item of this.items)
            if (item.rect.intersects(region))
                result.add(item);

        return result;
    }

    getAll(result ?: Set<BoardItem>) : Set<BoardItem> {
        if (!result)
            result = new Set<BoardItem>();
        if (this.children.length > 0) {
            for (const child of this.children)
                child.getAll(result);
            return result;
        }

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

        for (const item of this.items)
            for (const child of this.children)
                child.insert(item);

        this.items.clear();
    }
}

export class Chunk extends QuadTree {
    public static readonly maxChunkSize = 10000;

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
        item.render(this.graphics);
    }

    deleteMany(items : Iterable<BoardItem>) : void {
        const bb = new MinMaxRect(new Point(Infinity, Infinity), new Point(-Infinity, -Infinity));
        for (const item of items) {
            this.delete(item);
            bb.append(item.rect);
        }

        this.graphics.scissor(bb.x - 15, bb.y - 15, bb.w + 30, bb.h + 30, () => {
            for (const item of board.getItemsWithinRect(bb.toRect()))
                item.render(this.graphics);
        });
    }

    resetGraphics() : void {
        this.graphics.clear();
        this.graphics.origin(this.x * Chunk.maxChunkSize, this.y * Chunk.maxChunkSize);
        this.graphics.zoom(viewport.state.scale);
    }
}
