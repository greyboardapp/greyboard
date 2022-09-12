import { createSignal } from "solid-js";
import { px } from "../../../utils/dom";
import Graphics from "./graphics";

export const [windowWidth, setWindowWidth] = createSignal(window.innerWidth);
export const [windowHeight, setWindowHeight] = createSignal(window.innerHeight);

export abstract class RendererLayer {
    public graphics! : Graphics;
    private canvas! : HTMLCanvasElement;

    start() : void {
        this.canvas = <canvas
            width={windowWidth()}
            height={windowHeight()}
            style={{
                width: px(windowWidth()),
                height: px(windowHeight()),
            }}></canvas> as HTMLCanvasElement;
        document.getElementById("canvasOverlayContainer")?.append(this.canvas);
        this.graphics = new Graphics(this.canvas, true);
    }

    stop() : void {}

    abstract onRender(dt : number) : void;
}
