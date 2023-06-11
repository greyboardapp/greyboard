// Disabled since createMutable checks seems to be bugged in eslint reactivity.
// Refer to documentation: https://www.solidjs.com/docs/latest#createmutable
/* eslint-disable solid/reactivity */

import { Component, createEffect, createSignal, Show } from "solid-js";
import { Motion } from "@motionone/solid";
import tweenjs, { Tween } from "@tweenjs/tween.js";
import { createMutable } from "solid-js/store";
import { untrack } from "solid-js/web";
import { cls, px } from "../../utils/dom/dom";
import Toolbar from "../toolbar/Toolbar";
import ToolbarButton from "../toolbar/ToolbarButton";

import styles from "./SelectionBox.module.scss";
import paletteIcon from "../../assets/icons/palette.svg";
import bringForwardIcon from "../../assets/icons/bringForward.svg";
import sendBackwardIcon from "../../assets/icons/sendBackward.svg";
import copyIcon from "../../assets/icons/copy.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import lockIcon from "../../assets/icons/lockOpen.svg";
import unlockIcon from "../../assets/icons/lock.svg";
import labelIcon from "../../assets/icons/label.svg";
import { quickEaseInTransition } from "../../utils/dom/motion";
import { toolbox } from "../../core/services/toolbox";
import { viewport } from "../../core/services/viewport";
import Tooltip from "../feedback/Tooltip";
import Text from "../typography/Text";
import Shortcut from "../data/Shortcut";
import app from "../../core/app";
import ToolbarInput from "../toolbar/ToolbarInput";
import { selection } from "../../core/services/selection";
import { track } from "../../utils/dom/solid";
import Panel from "../surfaces/Panel";
import { ColorPickerPanelContent } from "./panels/ColorpickerPanel";
import { ManipulationMode, ManipulationTool } from "../../core/services/toolbox/tool";
import { board } from "../../core/services/board";

interface SelectionBoundingBox {
    x : number;
    y : number;
    width : number;
    height : number;
}

const SelectionBox : Component = () => {
    const [paletteOpen, setPaletteOpen] = createSignal(false);
    const rect = createMutable<SelectionBoundingBox>({ x: 0, y: 0, width: 0, height: 0 });
    let transitionTween : Tween<SelectionBoundingBox> | null = null;

    const createTransition = (to : SelectionBoundingBox, duration : number) : Tween<SelectionBoundingBox> => new Tween(rect)
        .to(to)
        .duration(duration)
        .easing(tweenjs.Easing.Cubic.Out)
        .onComplete(() => (transitionTween = null));

    createEffect((prev ?: number[]) => {
        const prevCount = prev?.length ?? 0;
        const currCount = selection.state.ids.length;
        if (currCount > 0)
            untrack(() => {
                let bb = selection.state.rect();
                if (!bb)
                    return;
                bb = viewport.viewportToBoardRect(bb);
                transitionTween?.pause();
                if ((prevCount === 0 && currCount > 0) || (toolbox.state.selectedTool instanceof ManipulationTool && toolbox.state.selectedTool.mode !== ManipulationMode.Select)) {
                    rect.x = bb.x;
                    rect.y = bb.y;
                    rect.width = bb.w;
                    rect.height = bb.h;
                } else {
                    transitionTween = createTransition({ x: bb.x, y: bb.y, width: bb.w, height: bb.h }, 200).start();
                }
            });
        else
            setPaletteOpen(false);

        return selection.state.ids;
    });

    createEffect(() => {
        track(viewport.state.scale);
        transitionTween?.pause();
        untrack(() => {
            let bb = selection.state.rect();
            if (!bb)
                return;
            bb = viewport.viewportToBoardRect(bb);
            rect.x = bb.x;
            rect.y = bb.y;
            rect.width = bb.w;
            rect.height = bb.h;
        });
    });

    return (
        <Show when={selection.state.ids.length > 0 && toolbox.state.selectedTool && toolbox.state.selectedTool instanceof ManipulationTool}>
            <div
                class={styles.selectionBox}
                style={{
                    left: px(rect.x + viewport.state.offsetX),
                    top: px(rect.y + viewport.state.offsetY),
                    width: px(rect.width),
                    height: px(rect.height),
                }}
            >
                <div class={cls(styles.resizeKnob, styles.topLeft)}></div>
                <div class={cls(styles.resizeKnob, styles.topRight)}></div>
                <div class={cls(styles.resizeKnob, styles.bottomRight)}></div>
                <div class={cls(styles.resizeKnob, styles.bottomLeft)}></div>

                <Show when={!toolbox.state.isToolInAction}>
                    <Motion.div
                        initial={{ y: 30, opacity: 0, pointerEvents: "none" }}
                        animate={{ y: 0, opacity: 1, transition: quickEaseInTransition }}
                    >
                        <Panel size="s" class={styles.toolbar}>
                            <Show when={!selection.state.hasAllItemsLocked()}>
                                <div
                                    classList={{
                                        [styles.colorPalette]: true,
                                        [styles.colorPaletteOpen]: paletteOpen(),
                                    }}
                                >
                                    <div>
                                        <div style={{ "max-width": "278px" }}>
                                            <ColorPickerPanelContent
                                                showColorPicker={false}
                                                activeColor={selection.state.color()}
                                                sliderModel={[selection.state.weight, (v) => selection.setWeight(v)]}
                                                weightPicked={(newWeight, oldWeight) => board.setWeightAction({ items: selection.state.items(), newWeight, oldWeight }, false)}
                                                colorPicked={(color) => selection.setColor(color)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Show>
                            <Toolbar variant="transparent">
                                <Show when={!selection.state.hasAllItemsLocked()}>
                                    <ToolbarButton icon={paletteIcon} onClick={() => setPaletteOpen(!paletteOpen())} />
                                    <Tooltip content={<><Text content="actions.bringForward" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.bringForward.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                        <ToolbarButton icon={bringForwardIcon} onClick={selection.bringForward} />
                                    </Tooltip>
                                    <Tooltip content={<><Text content="actions.sendBackward" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.sendBackward.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                        <ToolbarButton icon={sendBackwardIcon} onClick={selection.sendBackward} />
                                    </Tooltip>
                                </Show>
                                <Tooltip content={<><Text content="actions.copy" size="s" uppercase bold as="span" /> <Shortcut shortcut={app.undo.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                    <ToolbarButton icon={copyIcon} onClick={selection.copyToClipboard} />
                                </Tooltip>
                                <Show
                                    when={!selection.state.hasAllItemsLocked()}
                                >
                                    <Tooltip content={<><Text content="actions.delete" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.delete.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                        <ToolbarButton icon={deleteIcon} onClick={selection.delete} />
                                    </Tooltip>
                                </Show>
                                <Show
                                    when={selection.state.hasUnlockedItem()}
                                    fallback={
                                        <Tooltip content={<><Text content="actions.unlock" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.unlock.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                            <ToolbarButton icon={unlockIcon} onClick={selection.unlock} />
                                        </Tooltip>
                                    }>
                                    <Tooltip content={<><Text content="actions.lock" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.lock.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                        <ToolbarButton icon={lockIcon} onClick={selection.lock} />
                                    </Tooltip>
                                </Show>
                                <Show when={selection.state.ids.length === 1 && !selection.state.hasAllItemsLocked()}>
                                    <Show
                                        when={selection.state.hasLabel()}
                                        fallback={
                                            <Tooltip content={<><Text content="actions.addLabel" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.toggleLabel.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                                <ToolbarButton icon={labelIcon} onClick={selection.toggleLabel} />
                                            </Tooltip>
                                        }
                                    >
                                        <Tooltip content={<><Text content="actions.removeLabel" size="s" uppercase bold as="span" /> <Shortcut shortcut={selection.toggleLabel.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                            <ToolbarButton icon={labelIcon} onClick={selection.toggleLabel} />
                                        </Tooltip>
                                        <ToolbarInput
                                            class={styles.input}
                                            model={[
                                                () => selection.state.label() ?? "",
                                                (v) => selection.setLabel(v),
                                            ]}
                                            onChange={(e, newLabel, oldLabel) => {
                                                selection.setLabel(newLabel);
                                                board.setLabelAction({ items: selection.state.items(), newLabel, oldLabel }, false);
                                                return true;
                                            }}
                                            placeholder="placeholder.typeSomething" />
                                    </Show>
                                </Show>
                            </Toolbar>
                        </Panel>
                    </Motion.div>
                </Show>
            </div>
        </Show>
    );
};

export default SelectionBox;
