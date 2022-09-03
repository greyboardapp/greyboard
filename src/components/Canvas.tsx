import { Component, createSignal } from "solid-js";
import { ResizeEvent } from "../core/services/graphics/renderer";
import { createWindowListener, useEventDispatcher } from "../utils/hooks";

import styles from "./Canvas.module.scss";

const Canvas : Component = () => {
    const dispatcher = useEventDispatcher();

    const [width, setWidth] = createSignal(window.innerWidth);
    const [height, setHeight] = createSignal(window.innerHeight);

    createWindowListener("resize", () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        dispatcher.dispatch(new ResizeEvent(null));
    });

    return (
        <div
            class={styles.canvasContainer}
        >
            <canvas id="staticCanvas" width={width()} height={height()}></canvas>
            <canvas id="dynamicCanvas" width={width()} height={height()}></canvas>
        </div>
    );
};

export default Canvas;
