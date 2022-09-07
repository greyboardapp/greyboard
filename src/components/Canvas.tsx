import { Component, createSignal } from "solid-js";
import Point from "../core/data/geometry/point";
import { dynamicRenderer } from "../core/services/renderer";
import { input, KeyModifiers, MouseButton, PointerEventData } from "../core/services/input";
import { createWindowListener } from "../utils/hooks";

import styles from "./Canvas.module.scss";

const Canvas : Component = () => {
    const [width, setWidth] = createSignal(window.innerWidth);
    const [height, setHeight] = createSignal(window.innerHeight);

    createWindowListener("resize", () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        dynamicRenderer.onResize(window.innerWidth, window.innerHeight);
    });

    const getPointerEventData = (e : MouseEvent | WheelEvent | TouchEvent) : PointerEventData => {
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
            delta: e instanceof WheelEvent ? e.deltaY : 0,
        };
    };

    return (
        <div
            class={styles.canvasContainer}
            onMouseDown={(e) : void => input.onPointerDown(getPointerEventData(e))}
            onTouchStart={(e) : void => input.onPointerDown(getPointerEventData(e))}
            onMouseMove={(e) : void => input.onPointerMove(getPointerEventData(e))}
            onTouchMove={(e) : void => input.onPointerMove(getPointerEventData(e))}
            onMouseUp={(e) : void => input.onPointerUp(getPointerEventData(e))}
            onTouchEnd={(e) : void => input.onPointerUp(getPointerEventData(e))}
            onMouseLeave={(e) : void => input.onPointerUp(getPointerEventData(e))}
            onTouchCancel={(e) : void => input.onPointerUp(getPointerEventData(e))}
            onWheel={(e) : void => input.onZoom(getPointerEventData(e))}
        >
            <canvas id="staticCanvas" width={width()} height={height()}></canvas>
            <canvas id="dynamicCanvas" width={width()} height={height()}></canvas>
        </div>
    );
};

export default Canvas;
