import Color from "../../../utils/system/color";
import Rect from "../../data/geometry/rect";

export default class Graphics {
    private static readonly backgroundColor = "#222222";

    private readonly ctx : CanvasRenderingContext2D;
    constructor(private readonly canvas : HTMLCanvasElement, private readonly alpha = false) {
        const ctx = canvas.getContext("2d", { alpha });
        if (!ctx)
            throw new Error("no context");
        this.ctx = ctx;
    }

    clear() : void {
        this.reset();
        if (!this.alpha) {
            this.ctx.fillStyle = Graphics.backgroundColor;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    reset() : void {
        this.ctx.resetTransform();
    }

    origin(x : number, y : number) : void {
        this.ctx.translate(-x, -y);
    }

    zoom(scale : number) : void {
        this.ctx.scale(scale, scale);
    }

    scissor(x : number, y : number, w : number, h : number, render : () => void) : void {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, w, h);
        this.ctx.clip();
        this.ctx.fillStyle = Graphics.backgroundColor;
        this.ctx.fillRect(x, y, w, h);
        render();
        this.ctx.restore();
    }

    rect(rect : Rect, color : number, filled = false) : void {
        this.rectangle(rect.x, rect.y, rect.w, rect.h, color, filled);
    }

    rectangle(x : number, y : number, w : number, h : number, color : number, filled = false) : void {
        if (filled) {
            this.ctx.fillStyle = Color.UIntToHex(color);
            this.ctx.fillRect(x, y, w, h);
        } else {
            this.ctx.strokeStyle = Color.UIntToHex(color);
            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    path(path : Path2D, color : number) : void {
        this.ctx.fillStyle = Color.UIntToHex(color);
        this.ctx.fill(path);
    }
}
