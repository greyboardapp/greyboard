import autoBind from "auto-bind";
import { distSq } from "../../utils/geometry";
import createDelegate from "../../utils/system/delegate";
import { createService, Service } from "../../utils/system/service";
import Point from "../data/geometry/point";

export enum KeyModifiers {
    None = 0,
    Alt = 1,
    Control = 2,
    Meta = 4,
    Shift = 8,
}

export enum MouseButton {
    Primary,
    Auxiliary,
    Secondary,
}

export interface PointerEventData {
    button : MouseButton;
    modifiers : KeyModifiers;
    positions : Point[];
    delta : number;
}

export class Input extends Service<{}> {
    public onPointerDown = createDelegate<[data: PointerEventData]>();
    public onPointerMove = createDelegate<[data: PointerEventData]>();
    public onPointerUp = createDelegate<[data: PointerEventData]>();
    public onZoom = createDelegate<[data: PointerEventData]>();

    private readonly pressedMouseButtons = new Map<MouseButton, boolean>();
    private pointerPositions : Point[] = [];
    private prevPointerPositions : Point[] = [];

    constructor() {
        super({});
        autoBind(this);
    }

    start() : void {
        this.onPointerDown.add(this.pointerDownEvent);
        this.onPointerMove.add(this.pointerMoveEvent);
        this.onPointerUp.add(this.pointerUpEvent);
        this.onZoom.add(this.zoomEvent);
    }

    stop() : void {
        this.onPointerDown.clear();
        this.onPointerMove.clear();
        this.onPointerUp.clear();
        this.onZoom.clear();
    }

    private pointerDownEvent(data : PointerEventData) : boolean {
        this.pressedMouseButtons.set(data.button, true);
        return false;
    }

    private pointerMoveEvent(data : PointerEventData) : boolean {
        this.prevPointerPositions = this.pointerPositions;
        this.pointerPositions = data.positions;

        if (this.pointerPositions.length > 1) {
            const d = distSq(this.pointerPositions[0], this.pointerPositions[1]);
            const pd = distSq(this.prevPointerPositions[0], this.prevPointerPositions[1]);
            if (d !== 0 && pd !== 0 && d !== 0) {
                data.delta = d / pd;
                this.onZoom(data);
            }
        }

        return false;
    }

    private pointerUpEvent(data : PointerEventData) : boolean {
        this.pressedMouseButtons.set(data.button, false);
        return false;
    }

    private zoomEvent(data : PointerEventData) : boolean {
        return false;
    }
}

export const input = createService(Input);
