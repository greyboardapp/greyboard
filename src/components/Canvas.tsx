import { Component, createSignal, Show } from "solid-js";
import { dynamicRenderer } from "../core/services/renderer";
import { input } from "../core/services/input";
import { createWindowListener } from "../utils/hooks";

import styles from "./Canvas.module.scss";
import { viewport } from "../core/services/viewport";
import { px } from "../utils/dom";

const Canvas : Component = () => {
    const [width, setWidth] = createSignal(window.innerWidth);
    const [height, setHeight] = createSignal(window.innerHeight);

    createWindowListener("resize", () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
        dynamicRenderer.onResize(window.innerWidth, window.innerHeight);
    });

    return (
        <div
            class={styles.canvasContainer}
            onMouseDown={(e) : void => input.processPointerDownEvent(e)}
            onTouchStart={(e) : void => input.processPointerDownEvent(e)}
            onMouseMove={(e) : void => input.processPointerMoveEvent(e)}
            onTouchMove={(e) : void => input.processPointerMoveEvent(e)}
            onMouseUp={(e) : void => input.processPointerUpEvent(e)}
            onTouchEnd={(e) : void => input.processPointerUpEvent(e)}
            onMouseLeave={(e) : void => input.processPointerUpEvent(e)}
            onTouchCancel={(e) : void => input.processPointerUpEvent(e)}
            onWheel={(e) : void => input.processZoomEvent(e)}
        >
            <div id="canvasLayerRoot" class={styles.canvasLayerRoot}>
                <div id="staticCanvasContainer" class={styles.staticCanvasContainer} style={{
                    left: px(viewport.state.offsetX),
                    top: px(viewport.state.offsetY),
                }}></div>
                <div id="canvasOverlayContainer" class={styles.canvasOverlayContainer}>
                    <canvas id="dynamicCanvas" width={width()} height={height()}></canvas>
                    <Show when={!!import.meta.env.DEBUG}><canvas id="debugCanvas" width={width()} height={height()}></canvas></Show>
                </div>
            </div>
        </div>
    );
};

export default Canvas;
