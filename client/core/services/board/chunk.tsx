import { px } from "../../../utils/dom/dom";
import { generateId } from "../../../utils/datatypes/id";
import { getOperatingSystem, OperatingSystem } from "../../../utils/system/system";
import Rect from "../../data/geometry/rect";
import { BoardItem } from "../../data/item";
import Graphics from "../renderer/graphics";
import { viewport } from "../viewport";
import { QuadTree } from "./quadTree";

export class Chunk {
    public static maxChunkSize = getOperatingSystem() === OperatingSystem.Windows ? 10000 : 2000;

    public id = generateId();
    public qt : QuadTree;
    public canvas : HTMLCanvasElement;
    public graphics : Graphics;

    constructor(public x : number, public y : number) {
        this.qt = new QuadTree(new Rect(x * Chunk.maxChunkSize, y * Chunk.maxChunkSize, Chunk.maxChunkSize, Chunk.maxChunkSize), 0);
        this.canvas = <canvas
            width={Chunk.maxChunkSize}
            height={Chunk.maxChunkSize}
            style={{
                left: px(this.qt.boundary.x),
                top: px(this.qt.boundary.y),
                width: px(this.qt.boundary.w),
                height: px(this.qt.boundary.h),
            }}
        ></canvas> as HTMLCanvasElement;
        document.getElementById("staticCanvasContainer")?.append(this.canvas);
        this.graphics = new Graphics(this.canvas);
        this.resetGraphics();
    }

    get key() : string { return `${this.x}_${this.y}`; }

    static fromQuadTree(x : number, y : number, from : QuadTree) : Chunk {
        const chunk = new Chunk(x, y);
        chunk.qt = from;
        return chunk;
    }

    dispose() : void {
        this.canvas.remove();
    }

    insert(item : BoardItem) : void {
        if (this.qt.insert(item))
            item.render(this.graphics, false);
    }

    deleteMany(items : Iterable<BoardItem>) : void {
        const bb = Rect.invertedInfinite();
        for (const item of items) {
            this.qt.delete(item);
            bb.append(item.rect);
        }

        this.updateRegion(bb);
    }

    updateRegion(rect : Rect) : void {
        rect.inflate(45);

        rect.x = Math.floor(rect.x);
        rect.y = Math.floor(rect.y);
        rect.x2 = Math.ceil(rect.x2);
        rect.y2 = Math.ceil(rect.y2);

        this.graphics.scissor(rect.x, rect.y, rect.w, rect.h, async () => {
            const items = Array.from(this.qt.get(viewport.viewportToBoardRect(rect))).sort((a, b) => a.zIndex - b.zIndex);
            for (const item of items)
                item.render(this.graphics, false);
        });
    }

    rerender() : void {
        for (const item of this.qt.getAll())
            item.render(this.graphics, false);
    }

    resetGraphics() : void {
        this.graphics.clear();
        this.graphics.origin(this.x * Chunk.maxChunkSize, this.y * Chunk.maxChunkSize);
        this.graphics.zoom(viewport.state.scale);
    }
}
