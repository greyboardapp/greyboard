import { px } from "../../../utils/dom";
import { generateId } from "../../../utils/system/id";
import Rect from "../../data/geometry/rect";
import { BoardItem } from "../../data/item";
import Graphics from "../renderer/graphics";

export type QuadTreeSubdivisions = [QuadTree, QuadTree, QuadTree, QuadTree] | [];

export class QuadTree {
    public static readonly maxCapacity = 10;
    public static readonly maxDepth = 10;

    public items = new Set<BoardItem>();
    public children : QuadTreeSubdivisions = [];

    constructor(public boundary : Rect, private readonly depth = 0) {}

    insert(item : BoardItem) : void {
        if (!item.rect.intersects(this.boundary))
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
        if (!item.rect.intersects(this.boundary))
            return;

        for (const i of this.items)
            if (item === i) {
                this.items.delete(i);
                return;
            }

        for (const child of this.children)
            child.delete(item);
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

export class Chunk {
    public static readonly maxChunkSize = 10000;

    public id = generateId();
    public canvas : HTMLCanvasElement;
    public graphics : Graphics;

    private readonly storage : QuadTree;

    constructor(public x : number, public y : number) {
        this.storage = new QuadTree(new Rect(x, y, Chunk.maxChunkSize, Chunk.maxChunkSize));
        const canvasContainer = document.getElementById("staticCanvasContainer");
        this.canvas = document.createElement("canvas");
        this.canvas.style.left = px(x * Chunk.maxChunkSize);
        this.canvas.style.top = px(y * Chunk.maxChunkSize);
        this.canvas.width = Chunk.maxChunkSize;
        this.canvas.style.width = px(Chunk.maxChunkSize);
        this.canvas.height = Chunk.maxChunkSize;
        this.canvas.style.height = px(Chunk.maxChunkSize);
        canvasContainer?.append(this.canvas);
        this.graphics = new Graphics(this.canvas);
        this.graphics.origin(x * Chunk.maxChunkSize, y * Chunk.maxChunkSize);
    }

    get key() : string { return `${this.x}_${this.y}`; }

    add(item : BoardItem) : void {
        this.storage.insert(item);
        item.render(this.graphics);
    }

    remove(item : BoardItem) : void {
        this.storage.delete(item);
    }
}
