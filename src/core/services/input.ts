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

export interface KeyboardEventData {
    button : string;
    modifiers : KeyModifiers;
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
        str.push(this.key.toUpperCase());
        return str.join(" + ");
    }
}

export interface ShortcutBinding {
    shortcut : Shortcut;
    callback : (data : KeyboardEventData, shortcut : Shortcut) => void;
}

export class Input extends Service {
    public onPointerDown = createDelegate<[data : PointerEventData]>();
    public onPointerMove = createDelegate<[data : PointerEventData]>();
    public onPointerUp = createDelegate<[data : PointerEventData]>();
    public onZoom = createDelegate<[data : PointerEventData]>();
    public onKeyDown = createDelegate<[data : KeyboardEventData]>();
    public onKeyUp = createDelegate<[data : KeyboardEventData]>();
    public onShortcutFired = createDelegate<[data : KeyboardEventData, shortcut : Shortcut]>();

    private readonly pressedMouseButtons = new Map<MouseButton, boolean>();
    private pointerPositions : Point[] = [];
    private prevPointerPositions : Point[] = [];
    private readonly pressedKeyboardButtons = new Map<string, boolean>();
    private readonly shortcuts : ShortcutBinding[] = [];

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
        this.onKeyDown.clear();
        this.onKeyUp.clear();
        this.onShortcutFired.clear();
        this.shortcuts.clear();
    }

    processPointerDownEvent(e : MouseEvent | TouchEvent) : void {
        e.preventDefault();
        (document.activeElement as HTMLElement).blur();
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

    processKeyDownEvent(e : KeyboardEvent) : void {
        if ((e.target as HTMLElement).tagName === "INPUT")
            return;
        if (e.key.startsWith("F") && e.key.length > 1)
            return;
        e.preventDefault();
        const data = this.toKeyboardEventData(e);
        this.pressedKeyboardButtons.set(data.button, true);
        this.onKeyDown(data);
    }

    processKeyUpEvent(e : KeyboardEvent) : void {
        if ((e.target as HTMLElement).tagName === "INPUT")
            return;
        if (e.key.startsWith("F") && e.key.length > 1)
            return;
        e.preventDefault();
        const data = this.toKeyboardEventData(e);
        this.pressedKeyboardButtons.set(data.button, false);
        this.onKeyUp(data);
        for (const shortcut of this.shortcuts)
            if (shortcut.shortcut.key.toUpperCase() === data.button.toUpperCase() && shortcut.shortcut.modifiers === data.modifiers) {
                this.onShortcutFired(data, shortcut.shortcut);
                shortcut.callback(data, shortcut.shortcut);
                break;
            }
    }

    registerShortcut(shortcut : Shortcut, callback : (data : KeyboardEventData, shortcut : Shortcut) => void) : void {
        this.shortcuts.push({ shortcut, callback });
    }

    private toPointerEventData(e : MouseEvent | WheelEvent | TouchEvent) : PointerEventData {
        return {
            button: (e instanceof MouseEvent || e instanceof WheelEvent) ? e.button : MouseButton.Primary,
            modifiers: this.getKeyModifiers(e),
            positions: (e instanceof MouseEvent || e instanceof WheelEvent) ?
                [new Point(e.clientX, e.clientY)] :
                Array.from(e.touches).map((touch) => new Point(touch.clientX, touch.clientY)),
            movement: [], // movement can not be calculated here since on up event the move fired right before it, resulting in a 0 movement
            delta: e instanceof WheelEvent ? e.deltaY : 0,
        };
    }

    private toKeyboardEventData(e : KeyboardEvent) : KeyboardEventData {
        return {
            button: e.key,
            modifiers: this.getKeyModifiers(e),
        };
    }

    private getKeyModifiers(e : MouseEvent | WheelEvent | TouchEvent | KeyboardEvent) : KeyModifiers {
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

export const input = createService(Input);
