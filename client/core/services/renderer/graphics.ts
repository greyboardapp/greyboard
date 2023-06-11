import imageCompression from "browser-image-compression";
import Color from "../../../utils/datatypes/color";
import Point from "../../data/geometry/point";
import Rect from "../../data/geometry/rect";
import { toDataUrl } from "../../../utils/system/image";
import { TextAlignment } from "../../../utils/system/text";
import { caveat } from "../../../utils/system/fonts";

export default class Graphics {
    private static readonly backgroundColor = "#222222";
    private readonly ctx : CanvasRenderingContext2D;

    constructor(private readonly canvas : HTMLCanvasElement, private readonly alpha = false) {
        const ctx = canvas.getContext("2d", { alpha });
        if (!ctx)
            throw new Error("no context");
        this.ctx = ctx;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
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

    rect(rect : Rect, color : number, weight : number, filled = false) : void {
        this.rectangle(rect.x, rect.y, rect.x2 - rect.x, rect.y2 - rect.y, color, weight, filled);
    }

    rectangle(x : number, y : number, w : number, h : number, color : number, weight : number, filled = false) : void {
        if (filled) {
            this.ctx.fillStyle = Color.UIntToHex(color);
            this.ctx.fillRect(x, y, w, h);
        } else {
            this.ctx.strokeStyle = Color.UIntToHex(color);
            this.ctx.lineWidth = weight;
            this.ctx.beginPath();
            this.ctx.rect(x, y, w, h);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    ellipse(rect : Rect, color : number, weight : number, filled = false) : void {
        this.ctx.beginPath();
        this.ctx.ellipse(Math.min(rect.x, rect.x2) + rect.w / 2, Math.min(rect.y, rect.y2) + rect.h / 2, Math.abs(rect.w / 2), Math.abs(rect.h / 2), 0, 0, 360);
        if (filled) {
            this.ctx.fillStyle = Color.UIntToHex(color);
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = Color.UIntToHex(color);
            this.ctx.lineWidth = weight;
            this.ctx.stroke();
        }
        this.ctx.closePath();
    }

    path(path : Path2D, color : number) : void {
        this.ctx.fillStyle = Color.UIntToHex(color);
        this.ctx.fill(path);
    }

    curve(points : Point[], color : number, weight : number) : void {
        if (points.length === 0)
            return;

        this.ctx.beginPath();
        if (points.length === 1) {
            this.ctx.fillStyle = Color.UIntToHex(color);
            this.ctx.ellipse(points[0].x, points[0].y, weight, weight, 0, 0, 360);
            this.ctx.fill();
        } else {
            this.ctx.strokeStyle = Color.UIntToHex(color);
            this.ctx.lineWidth = weight;
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 0; i < points.length - 1; ++i)
                this.ctx.quadraticCurveTo(
                    points[i].x,
                    points[i].y,
                    points[i].x + (points[i + 1].x - points[i].x) * 0.5,
                    points[i].y + (points[i + 1].y - points[i].y) * 0.5,
                );
            this.ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            this.ctx.stroke();
        }

        this.ctx.closePath();
    }

    image(rect : Rect, img : CanvasImageSource) : void {
        this.ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
    }

    async getImage(bb : Rect) : Promise<string | null> {
        const w = Math.max(300, Math.min(1280, bb.w));
        const h = Math.max(300, Math.min(620, bb.h));
        const bitmap = await createImageBitmap(this.canvas, bb.x - 10, bb.y - 10, w, h);

        const offscreen = new OffscreenCanvas(w, h);
        const offscreenCtx = offscreen.getContext("2d");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        offscreenCtx?.drawImage(bitmap, 0, 0);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const compressedBlob = await imageCompression((await offscreen.convertToBlob()) as File, {
            alwaysKeepResolution: true,
            maxWidthOrHeight: 300,
            maxSizeMB: 0.001,
            initialQuality: 0.1,
            useWebWorker: true,
        });

        const image = await toDataUrl(URL.createObjectURL(compressedBlob));
        return image?.toString() ?? null;
    }

    async text(rect : Rect, text : string, color : number, weight : number, size : number, alignment : TextAlignment) : Promise<void> {
        const font = `${weight * 100} ${size}px ${caveat.family}`;
        await document.fonts.load(font);
        const lines = text.split("\n");
        this.ctx.font = font;
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        this.ctx.fillStyle = Color.UIntToHex(color);
        for (let i = 0; i < lines.length; i++)
            if (alignment === TextAlignment.Left) {
                this.ctx.fillText(lines[i], rect.x + 10, rect.y + (size * i) + 10 + (size * 0.09), rect.w - 20);
            } else {
                const width = this.measureText(rect, lines[i], weight, size);
                if (alignment === TextAlignment.Center)
                    this.ctx.fillText(lines[i], (rect.x + (rect.w - 20 - width) / 2) + 10, rect.y + (size * i) + 10 + (size * 0.09), rect.w - 20);
                else
                    this.ctx.fillText(lines[i], (rect.x + (rect.w - 20 - width)) + 10, rect.y + (size * i) + 10 + (size * 0.09), rect.w - 20);
            }
    }

    measureText(rect : Rect, text : string, weight : number, size : number) : number {
        this.ctx.font = `${weight * 100} ${size}px Caveat`;
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "top";

        return this.ctx.measureText(text).width;
    }
}
