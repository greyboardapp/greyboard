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
    movement : Point[];
    delta : number;
}

export class Shortcut {
    constructor(
        public key : string,
        public modifiers : KeyModifiers = KeyModifiers.None,
    ) {}

    toString() : string {
        const str : string[] = [];
        if (this.modifiers & KeyModifiers.Control)
            str.push("CTRL");
        if (this.modifiers & KeyModifiers.Shift)
            str.push("SHIFT");
        if (this.modifiers & KeyModifiers.Alt)
            str.push("ALT");
        str.push(this.key);
        return str.join(" + ");
    }
}

export class Input extends Service {
    public onPointerDown = createDelegate<[data : PointerEventData]>();
    public onPointerMove = createDelegate<[data : PointerEventData]>();
    public onPointerUp = createDelegate<[data : PointerEventData]>();
    public onZoom = createDelegate<[data : PointerEventData]>();

    private readonly pressedMouseButtons = new Map<MouseButton, boolean>();
    private pointerPositions : Point[] = [];
    private prevPointerPositions : Point[] = [];

    constructor() {
        super({});
        autoBind(this);
    }

    start() : void {}

    stop() : void {
        this.onPointerDown.clear();
        this.onPointerMove.clear();
        this.onPointerUp.clear();
        this.onZoom.clear();
    }

    processPointerDownEvent(e : MouseEvent | TouchEvent) : void {
        e.preventDefault();
        const data = this.toPointerEventData(e);
        this.pressedMouseButtons.set(data.button, true);
        this.onPointerDown(data);
    }

    processPointerMoveEvent(e : MouseEvent | TouchEvent) : void {
        e.preventDefault();
        const data = this.toPointerEventData(e);
        this.prevPointerPositions = this.pointerPositions;
        this.pointerPositions = data.positions;
        data.movement = this.pointerPositions.map((p, i) => new Point(p.x - (this.prevPointerPositions[i]?.x ?? p.x), p.y - (this.prevPointerPositions[i]?.y ?? p.y)));

        if (this.pointerPositions.length > 1) {
            const d = distSq(this.pointerPositions[0], this.pointerPositions[1]);
            const pd = distSq(this.prevPointerPositions[0], this.prevPointerPositions[1]);
            if (d !== 0 && pd !== 0 && d !== 0) {
                data.delta = d / pd;
                this.onZoom(data);
            }
        }
        this.onPointerMove(data);
    }

    processPointerUpEvent(e : MouseEvent | TouchEvent) : void {
        e.preventDefault();
        const data = this.toPointerEventData(e);
        data.movement = this.pointerPositions.map((p, i) => new Point(p.x - (this.prevPointerPositions[i]?.x ?? p.x), p.y - (this.prevPointerPositions[i]?.y ?? p.y)));
        this.pressedMouseButtons.set(data.button, false);
        this.onPointerUp(data);
    }

    processZoomEvent(e : MouseEvent | WheelEvent | TouchEvent) : void {
        e.preventDefault();
        const data = this.toPointerEventData(e);
        this.onZoom(data);
    }

    private toPointerEventData(e : MouseEvent | WheelEvent | TouchEvent) : PointerEventData {
        let modifiers = KeyModifiers.None;
        if (e.altKey)
            modifiers |= KeyModifiers.Alt;
        if (e.ctrlKey)
            modifiers |= KeyModifiers.Control;
        if (e.shiftKey)
            modifiers |= KeyModifiers.Shift;
        if (e.metaKey)
            modifiers |= KeyModifiers.Meta;

        return {
            button: (e instanceof MouseEvent || e instanceof WheelEvent) ? e.button : MouseButton.Primary,
            modifiers,
            positions: (e instanceof MouseEvent || e instanceof WheelEvent) ?
                [new Point(e.clientX, e.clientY)] :
                Array.from(e.touches).map((touch) => new Point(touch.clientX, touch.clientY)),
            movement: [], // movement can not be calculated here since on up event the move fired right before it, resulting in a 0 movement
            delta: e instanceof WheelEvent ? e.deltaY : 0,
        };
    }
}

export const input = createService(Input);
