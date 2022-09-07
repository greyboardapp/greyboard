import Color from "../../../utils/system/color";
import Rect from "../../data/geometry/rect";

export default class Graphics {
    private readonly ctx : CanvasRenderingContext2D;
    constructor(private readonly canvas : HTMLCanvasElement, alpha = false) {
        const ctx = canvas.getContext("2d", { alpha });
        if (!ctx)
            throw new Error("no context");
        this.ctx = ctx;
    }

    clear(color ?: string) : void {
        if (color) {
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    scissor(x : number, y : number, w : number, h : number, render : () => void) : void {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, w, h);
        this.ctx.clip();
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(x, y, w, h);
        render();
        this.ctx.restore();
    }

    rect(rect : Rect, color : number) : void {
        this.ctx.fillStyle = Color.UIntToHex(color);
        this.ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
}