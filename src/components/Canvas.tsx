import { Component } from "solid-js";
import { input } from "../core/services/input";
import { createWindowListener } from "../utils/hooks";

import styles from "./Canvas.module.scss";
import { viewport } from "../core/services/viewport";
import { px } from "../utils/dom";
import { setWindowHeight, setWindowWidth } from "../core/services/renderer/layer";

const Canvas : Component = () => {
    createWindowListener("resize", () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
    });

    createWindowListener("keydown", (e) => {
        input.processKeyDownEvent(e as KeyboardEvent);
    });

    createWindowListener("keyup", (e) => {
        input.processKeyUpEvent(e as KeyboardEvent);
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
                <div id="canvasOverlayContainer" class={styles.canvasOverlayContainer}></div>
            </div>
        </div>
    );
};

export default Canvas;
