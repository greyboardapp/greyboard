import Rect from "../../data/geometry/rect";
import type { BoardItem } from "../../data/item";
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
