import { Component, createMemo, Show } from "solid-js";
import { Motion } from "@motionone/solid";
import { cls, px } from "../../utils/dom/dom";
import Toolbar from "../toolbar/Toolbar";
import ToolbarButton from "../toolbar/ToolbarButton";

import styles from "./SelectionBox.module.scss";
import paletteIcon from "../../assets/icons/palette.svg";
import { quickEaseInTransition } from "../../utils/dom/motion";
import Rect from "../../core/data/geometry/rect";
import { toolbox } from "../../core/services/toolbox";
import { board } from "../../core/services/board";
import { viewport } from "../../core/services/viewport";

const SelectionBox : Component = () => {
    const getBoundingBox = createMemo(() => {
        const bb = Rect.invertedInfinite();
        for (const id of toolbox.state.selectedItemIds) {
            const item = board.items.get(id);
            if (item)
                bb.append(item.rect);
        }
        return viewport.viewportToScreenRect(bb);
    });

    return (
        <Show when={toolbox.state.selectedItemIds.length > 0}>
            <div
                class={styles.selectionBox}
                style={{
                    left: px(getBoundingBox().x),
                    top: px(getBoundingBox().y),
                    width: px(getBoundingBox().w),
                    height: px(getBoundingBox().h),
                }}
            >
                <div class={cls(styles.resizeKnob, styles.topLeft)}></div>
                <div class={cls(styles.resizeKnob, styles.topRight)}></div>
                <div class={cls(styles.resizeKnob, styles.bottomRight)}></div>
                <div class={cls(styles.resizeKnob, styles.bottomLeft)}></div>

                <Motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, transition: quickEaseInTransition }}
                >
                    <Toolbar class={styles.toolbar} variant="floating">
                        <ToolbarButton icon={paletteIcon} />
                    </Toolbar>
                </Motion.div>
            </div>
        </Show>
    );
};

export default SelectionBox;
