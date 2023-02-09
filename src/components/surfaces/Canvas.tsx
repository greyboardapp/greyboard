import { Component } from "solid-js";
import { input, PointerType } from "../../core/services/input";
import { createWindowListener } from "../../utils/dom/hooks";

import styles from "./Canvas.module.scss";
import { viewport } from "../../core/services/viewport";
import { pct, px } from "../../utils/dom/dom";
import { setWindowHeight, setWindowWidth } from "../../core/services/renderer/layer";
import { toolbox } from "../../core/services/toolbox";
import { ViewTool } from "../../core/services/toolbox/view";
import { selection } from "../../core/services/selection";
import { board } from "../../core/services/board";

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

    createWindowListener("copy", selection.copyToClipboard);

    createWindowListener("paste", (e) => {
        const data = (e as ClipboardEvent).clipboardData;
        if (!data)
            return;
        toolbox.pasteFromClipboard(data);
    });

    const getCursor = () : string => {
        if (toolbox.state.selectedTool === toolbox.getTool(ViewTool) && toolbox.state.isToolInAction)
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
            <div id="canvasLayerRoot"
                class={styles.canvasLayerRoot}
                style={{
                    cursor: getCursor(),
                }}
            >
                <div id="staticCanvasContainer" class={styles.staticCanvasContainer} style={{
                    left: px(viewport.state.offsetX),
                    top: px(viewport.state.offsetY),
                    scale: pct(board.state.temporaryScale),
                }}></div>
                <div id="canvasOverlayContainer" class={styles.canvasOverlayContainer}></div>
            </div>
        </div>
    );
};

export default Canvas;
