import Point from "../data/geometry/point";
import { batched, createService, Service } from "../../utils/system/service";
import { input } from "./input";

interface ViewportState {
    offsetX : number;
    offsetY : number;
    scale : number;
}

export class Viewport extends Service<ViewportState> {
    constructor() {
        super({
            offsetX: 0,
            offsetY: 0,
            scale: 1,
        });

        input.onZoom.add((data) => this.zoom(data.positions[0], data.delta));
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
        console.log("ZOOM", c, d);
        // if (!inRange(this.scale - d, 0.1, 4))
        //     return;
        this.pan(c.inverted());
        this.state.scale -= d;
        this.pan(c);
    }
}

export const viewport = createService<ViewportState, Viewport>(Viewport);
