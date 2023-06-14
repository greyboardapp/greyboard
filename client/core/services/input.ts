import autoBind from "auto-bind";
import { distSq } from "../../utils/math/geometry";
import createDelegate from "../../utils/datatypes/delegate";
import { createService, Service } from "../../utils/system/service";
import Point, { PressurePoint } from "../data/geometry/point";
import { commands } from "./commands";

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

export enum PointerType {
    Mouse,
    Touch,
    Pen,
}

export interface PointerEventData {
    type : PointerType;
    button : MouseButton;
    modifiers : KeyModifiers;
    positions : PressurePoint[];
    movement : Point[];
    delta : number;
}

export interface KeyboardEventData {
    button : string;
    modifiers : KeyModifiers;
    repeatCount : number;
}

export interface InputState {
    lastUsedPointerType : PointerType;
}

export class Input extends Service<InputState> {
    public onPointerDown = createDelegate<[data : PointerEventData]>();
    public onPointerMove = createDelegate<[data : PointerEventData]>();
    public onPointerUp = createDelegate<[data : PointerEventData]>();
    public onZoom = createDelegate<[data : PointerEventData]>();
    public onKeyDown = createDelegate<[data : KeyboardEventData]>();
    public onKeyUp = createDelegate<[data : KeyboardEventData]>();

    private readonly pressedMouseButtons = new Map<MouseButton, boolean>();
    private pointerPositions : Point[] = [];
    private prevPointerPositions : Point[] = [];
    private readonly pressedKeyboardButtons = new Map<string, number>();

    constructor() {
        super({
            lastUsedPointerType: PointerType.Mouse,
        });
        autoBind(this);
    }

    pointerPosition() : Point {
        return this.pointerPositions[0] ?? new Point();
    }

    start() : void {}

    stop() : void {
        this.onPointerDown.clear();
        this.onPointerMove.clear();
        this.onPointerUp.clear();
        this.onZoom.clear();
        this.onKeyDown.clear();
        this.onKeyUp.clear();
    }

    processPointerDownEvent(e : PointerEvent | TouchEvent) : void {
        e.preventDefault();
        (document.activeElement as HTMLElement).blur();
        const data = this.toPointerEventData(e);
        this.pressedMouseButtons.set(data.button, true);
        this.onPointerDown(data);
        this.state.lastUsedPointerType = data.type;
    }

    processPointerMoveEvent(e : PointerEvent | TouchEvent) : void {
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
        this.state.lastUsedPointerType = data.type;
    }

    processPointerUpEvent(e : PointerEvent | TouchEvent) : void {
        e.preventDefault();
        const data = this.toPointerEventData(e);
        data.movement = this.pointerPositions.map((p, i) => new Point(p.x - (this.prevPointerPositions[i]?.x ?? p.x), p.y - (this.prevPointerPositions[i]?.y ?? p.y)));
        this.pressedMouseButtons.set(data.button, false);
        this.onPointerUp(data);
        this.state.lastUsedPointerType = data.type;
    }

    processZoomEvent(e : PointerEvent | WheelEvent | TouchEvent) : void {
        e.preventDefault();
        const data = this.toPointerEventData(e);
        this.onZoom(data);
    }

    processKeyDownEvent(e : KeyboardEvent) : void {
        if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA")
            return;
        const data = this.toKeyboardEventData(e);
        data.repeatCount = e.repeat ? (this.pressedKeyboardButtons.get(data.button) ?? 0) + 1 : 1;
        this.pressedKeyboardButtons.set(data.button, data.repeatCount);
        this.onKeyDown(data);

        if (commands.triggerCommand(data))
            e.preventDefault();
    }

    processKeyUpEvent(e : KeyboardEvent) : void {
        if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA")
            return;
        if (e.key.startsWith("F") && e.key.length > 1)
            return;
        const data = this.toKeyboardEventData(e);
        this.pressedKeyboardButtons.set(data.button, 0);
        this.onKeyUp(data);
    }

    isKeyPressed(button : string) : boolean {
        return (this.pressedKeyboardButtons.get(button) ?? 0) > 0;
    }

    isKeyModifierPressed(modifier : KeyModifiers) : boolean {
        switch (modifier) {
            case KeyModifiers.Alt:
                return this.isKeyPressed("Alt");
            case KeyModifiers.Control:
                return this.isKeyPressed("Control");
            case KeyModifiers.Meta:
                return this.isKeyPressed("OS");
            case KeyModifiers.Shift:
                return this.isKeyPressed("Shift");
            default:
                return false;
        }
    }

    private toPointerEventData(e : PointerEvent | WheelEvent | TouchEvent) : PointerEventData {
        let type = PointerType.Touch;
        if (e instanceof PointerEvent)
            type = (e.pointerType === "pen") ? PointerType.Pen : PointerType.Mouse;

        return {
            type,
            button: (e instanceof PointerEvent || e instanceof WheelEvent) ? e.button : MouseButton.Primary,
            modifiers: this.getKeyModifiers(e),
            positions: (e instanceof MouseEvent || e instanceof PointerEvent || e instanceof WheelEvent) ?
                [new PressurePoint(e.clientX, e.clientY, (e instanceof PointerEvent && e.pointerType === "pen") ? e.pressure : undefined)] :
                Array.from(e.touches).map((touch) => new Point(touch.clientX, touch.clientY)),
            movement: [], // movement can not be calculated here since on up event the move fired right before it, resulting in a 0 movement
            delta: e instanceof WheelEvent ? e.deltaY : 0,
        };
    }

    private toKeyboardEventData(e : KeyboardEvent) : KeyboardEventData {
        return {
            button: e.key,
            modifiers: this.getKeyModifiers(e),
            repeatCount: 0,
        };
    }

    private getKeyModifiers(e : PointerEvent | WheelEvent | TouchEvent | KeyboardEvent) : KeyModifiers {
        let modifiers = KeyModifiers.None;
        if (e.altKey)
            modifiers |= KeyModifiers.Alt;
        if (e.ctrlKey)
            modifiers |= KeyModifiers.Control;
        if (e.shiftKey)
            modifiers |= KeyModifiers.Shift;
        if (e.metaKey)
            modifiers |= KeyModifiers.Meta;
        return modifiers;
    }
}

export const input = createService<InputState, Input>(Input);
