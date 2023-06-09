import tweenjs, { Tween } from "@tweenjs/tween.js";
import { untrack } from "solid-js/web";
import { batch } from "solid-js";
import Point from "../data/geometry/point";
import { batched, createService, reactive, Service } from "../../utils/system/service";
import Rect from "../data/geometry/rect";
import { input, KeyModifiers } from "./input";
import { isInRange } from "../../utils/system/misc";
import createDelegate from "../../utils/datatypes/delegate";
import { createCommand, Shortcut } from "./commands";
import { track } from "../../utils/dom/solid";

export interface ViewportState {
    offsetX : number;
    offsetY : number;
    scale : number;
}

export class Viewport extends Service<ViewportState> {
    public onZoom = createDelegate();

    public zoomIn = createCommand(new Shortcut("=", KeyModifiers.Control), () => this.zoom(this.getScreenRect().center, -0.1));
    public zoomOut = createCommand(new Shortcut("-", KeyModifiers.Control), () => this.zoom(this.getScreenRect().center, 0.1));

    private inertiaTween : Tween<ViewportState> | null = null;

    constructor() {
        super({
            offsetX: 0,
            offsetY: 0,
            scale: 1,
        });
    }

    @batched
    pan(d : Point) : void {
        if (this.inertiaTween)
            tweenjs.remove(this.inertiaTween);

        this.state.offsetX += d.x;
        this.state.offsetY += d.y;
    }

    @batched
    panTo(p : Point) : void {
        if (this.inertiaTween)
            tweenjs.remove(this.inertiaTween);

        this.state.offsetX = p.x;
        this.state.offsetY = p.y;
    }

    @batched
    panRollOff(d : Point) : void {
        this.inertiaTween = new tweenjs.Tween(this.state)
            .to({ offsetX: this.state.offsetX + d.x * 5, offsetY: this.state.offsetY + d.y * 5 }, 500)
            .easing(tweenjs.Easing.Cubic.Out)
            .start()
            .onComplete(() => { this.inertiaTween = null; });
    }

    @batched
    centerOnPoint(p : Point) : void {
        new Tween(this.state).to({
            offsetX: -p.x + window.innerWidth / 2,
            offsetY: -p.y + window.innerHeight / 2,
        }, 200).easing(tweenjs.Easing.Cubic.Out).start();
    }

    @batched
    zoom(c : Point, d : number) : void {
        if (!isInRange(this.state.scale - d, 0.1, 4))
            return;

        if (this.inertiaTween)
            tweenjs.remove(this.inertiaTween);

        const newScale = this.state.scale - d;
        this.state.offsetX += c.x * this.state.scale - c.x * newScale;
        this.state.offsetY += c.y * this.state.scale - c.y * newScale;
        this.state.scale = newScale;
    }

    @reactive
    private zoomEvent() : void {
        track(this.state.scale);
        untrack(() => this.onZoom());
    }

    start() : void {
        batch(() => {
            this.state.offsetX = this.state.offsetY = 0;
            this.state.scale = 1;
        });
        input.onZoom.add((data) => this.zoom(this.screenToViewport(data.positions[0]), Math.sign(data.delta) * 0.1));
    }

    stop() : void {
        this.onZoom.clear();
    }

    screenCenterToViewport() : Point {
        return new Point(((window.innerWidth / 2) - this.state.offsetX) / this.state.scale, ((window.innerHeight / 2) - this.state.offsetY) / this.state.scale);
    }

    screenToViewport(p : Point) : Point {
        return new Point((p.x - this.state.offsetX) / this.state.scale, (p.y - this.state.offsetY) / this.state.scale);
    }

    screenToViewportRect(a : Point, b : Point) : Rect {
        const x = (Math.min(a.x, b.x) - this.state.offsetX) / this.state.scale;
        const y = (Math.min(a.y, b.y) - this.state.offsetY) / this.state.scale;
        return new Rect(x, y, (Math.max(a.x, b.x) - this.state.offsetX) / this.state.scale - x, (Math.max(a.y, b.y) - this.state.offsetY) / this.state.scale - y);
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

    viewportToBoard(p : Point) : Point {
        if (this.state.scale === 1)
            return p;
        return new Point(p.x * this.state.scale, p.y * this.state.scale);
    }

    viewportToBoardRect(r : Rect) : Rect {
        if (this.state.scale === 1)
            return r;
        return new Rect(r.x * this.state.scale, r.y * this.state.scale, r.w * this.state.scale, r.h * this.state.scale);
    }

    viewportToScreenRect(r : Rect) : Rect {
        return new Rect((this.state.offsetX + r.x) * this.state.scale, (this.state.offsetY + r.y) * this.state.scale, r.w * this.state.scale, r.h * this.state.scale);
    }

    boardToScreenRect(r : Rect) : Rect {
        return new Rect(r.x / this.state.scale + this.state.offsetX, r.y / this.state.scale + this.state.offsetY, r.w / this.state.scale, r.h / this.state.scale);
    }

    pixelsToViewport(pixels : number) : number {
        return pixels * this.state.scale;
    }

    viewportToScreenPixels(pixels : number) : number {
        return pixels / this.state.scale;
    }

    getScreenRect() : Rect {
        return this.screenToBoardRect(new Point(0, 0), new Point(window.innerWidth, window.innerHeight));
    }
}

export const viewport = createService<ViewportState, Viewport>(Viewport);
