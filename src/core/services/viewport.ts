import Point from "../data/geometry/point";
import { batched, createService, Service } from "../../utils/system/service";
import Rect from "../data/geometry/rect";
import { Chunk } from "./board/chunk";

export interface ViewportState {
    offsetX : number;
    offsetY : number;
    scale : number;
}

export class Viewport extends Service<ViewportState> {
    constructor() {
        super({
            offsetX: Chunk.maxChunkSize / 2,
            offsetY: Chunk.maxChunkSize / 2,
            scale: 1,
        });

        // input.onZoom.add((data) => this.zoom(data.positions[0], data.delta));
    }

    @batched
    pan(d : Point) : void {
        this.state.offsetX += d.x / this.state.scale;
        this.state.offsetY += d.y / this.state.scale;
    }

    @batched
    panTo(p : Point) : void {
        this.state.offsetX = p.x;
        this.state.offsetY = p.y;
    }

    @batched
    zoom(c : Point, d : number) : void {
        // if (!inRange(this.state.scale - d, 0.1, 4))
        //     return;
        this.pan(c.inverted());
        this.state.scale -= d;
        this.pan(c);
    }

    screenToViewport(p : Point) : Point {
        return new Point(-this.state.offsetX + p.x / this.state.scale, -this.state.offsetY + p.y / this.state.scale);
    }

    viewportToScreen(p : Point) : Point {
        return new Point((this.state.offsetX + p.x) * this.state.scale, (this.state.offsetY + p.y) * this.state.scale);
    }

    viewportToScreenRect(r : Rect) : Rect {
        return new Rect((this.state.offsetX + r.x) * this.state.scale, (this.state.offsetY + r.y) * this.state.scale, r.w * this.state.scale, r.h * this.state.scale);
    }

    pixelsToViewport(pixels : number) : number {
        return pixels / this.state.scale;
    }

    getScreenRect() : Rect {
        return new Rect(-this.state.offsetX, -this.state.offsetY, window.innerWidth / this.state.scale, window.innerHeight / this.state.scale);
    }
}

export const viewport = createService<ViewportState, Viewport>(Viewport);
