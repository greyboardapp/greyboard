import { Component } from "solid-js";
import { input, PointerType } from "../../core/services/input";
import { createWindowListener } from "../../utils/hooks";

import styles from "./Canvas.module.scss";
import { viewport } from "../../core/services/viewport";
import { px } from "../../utils/dom";
import { setWindowHeight, setWindowWidth } from "../../core/services/renderer/layer";
import { toolbox } from "../../core/services/toolbox";
import { ViewTool } from "../../core/services/toolbox/view";

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

    const getCursor = () : string => {
        if (toolbox.state.selectedTool === toolbox.getTool(ViewTool) && toolbox.state.selectedTool.actionStarted)
            return "grabbing";
        if (input.state.lastUsedPointerType === PointerType.Pen)
            return "crosshair";
        return "default";
    };

    return (
        <div
            class={styles.canvasContainer}
            onPointerDown={(e) : void => input.processPointerDownEvent(e)}
            onTouchStart={(e) : void => input.processPointerDownEvent(e)}
            onPointerMove={(e) : void => input.processPointerMoveEvent(e)}
            onTouchMove={(e) : void => input.processPointerMoveEvent(e)}
            onPointerUp={(e) : void => input.processPointerUpEvent(e)}
            onTouchEnd={(e) : void => input.processPointerUpEvent(e)}
            onPointerLeave={(e) : void => input.processPointerUpEvent(e)}
            onTouchCancel={(e) : void => input.processPointerUpEvent(e)}
            onWheel={(e) : void => input.processZoomEvent(e)}
        >
            <div id="canvasLayerRoot" class={styles.canvasLayerRoot}>
                <div id="staticCanvasContainer" class={styles.staticCanvasContainer} style={{
                    left: px(viewport.state.offsetX),
                    top: px(viewport.state.offsetY),
                    cursor: getCursor(),
                }}></div>
                <div id="canvasOverlayContainer" class={styles.canvasOverlayContainer}></div>
            </div>
        </div>
    );
};

export default Canvas;
