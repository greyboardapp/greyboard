import Point from "../data/geometry/point";
import { batched, createService, reactive, Service } from "../../utils/system/service";
import Rect from "../data/geometry/rect";
import { input } from "./input";
import { isInRange, pass } from "../../utils/system/misc";
import createDelegate from "../../utils/system/delegate";

export interface ViewportState {
    offsetX : number;
    offsetY : number;
    originX : number;
    originY : number;
    scale : number;
}

export class Viewport extends Service<ViewportState> {
    public onZoom = createDelegate();

    constructor() {
        super({
            offsetX: 0,
            offsetY: 0,
            originX: 0,
            originY: 0,
            scale: 1,
        });
    }

    @batched
    pan(d : Point) : void {
        this.state.offsetX += d.x;
        this.state.offsetY += d.y;
    }

    @batched
    panTo(p : Point) : void {
        this.state.offsetX = p.x;
        this.state.offsetY = p.y;
    }

    @batched
    zoom(c : Point, d : number) : void {
        if (!isInRange(this.state.scale - d, 0.1, 4))
            return;
        const newScale = this.state.scale - d;
        this.state.offsetX += c.x * this.state.scale - c.x * newScale;
        this.state.offsetY += c.y * this.state.scale - c.y * newScale;
        this.state.scale = newScale;
    }

    @reactive
    private zoomEvent() : void {
        pass(this.state.scale);
        this.onZoom();
    }

    start() : void {
        input.onZoom.add((data) => this.zoom(this.screenToViewport(data.positions[0]), Math.sign(data.delta) * 0.1));
    }

    screenToViewport(p : Point) : Point {
        return new Point((p.x - this.state.offsetX) / this.state.scale, (p.y - this.state.offsetY) / this.state.scale);
    }

    screenToBoard(p : Point) : Point {
        return new Point(p.x - this.state.offsetX, p.y - this.state.offsetY);
    }

    screenToBoardRect(a : Point, b : Point) : Rect {
        return new Rect(Math.min(a.x, b.x) - this.state.offsetX, Math.min(a.y, b.y) - this.state.offsetY, Math.abs(a.x - b.x), Math.abs(a.y - b.y));
    }

    viewportToScreen(p : Point) : Point {
        return new Point(this.state.offsetX + p.x * this.state.scale, this.state.offsetY + p.y * this.state.scale);
    }

    viewportToScreenRect(r : Rect) : Rect {
        return new Rect((this.state.offsetX + r.x) * this.state.scale, (this.state.offsetY + r.y) * this.state.scale, r.w * this.state.scale, r.h * this.state.scale);
    }

    pixelsToViewport(pixels : number) : number {
        return pixels * this.state.scale;
    }

    getScreenRect() : Rect {
        return new Rect(-this.state.offsetX, -this.state.offsetY, window.innerWidth / this.state.scale, window.innerHeight / this.state.scale);
    }
}

export const viewport = createService<ViewportState, Viewport>(Viewport);
