import { Component, Show, createSignal, onCleanup, onMount } from "solid-js";
import { Motion } from "@motionone/solid";
import Text from "../../core/data/items/text";
import { toolbox } from "../../core/services/toolbox";
import { TextTool } from "../../core/services/toolbox/text";
import { selection } from "../../core/services/selection";
import { px } from "../../utils/dom/dom";
import styles from "./TextToolEditor.module.scss";
import Color from "../../utils/datatypes/color";
import { viewport } from "../../core/services/viewport";
import Panel from "../surfaces/Panel";
import { quickEaseInTransition } from "../../utils/dom/motion";
import Tooltip from "../feedback/Tooltip";
import Toolbar from "../toolbar/Toolbar";
import ToolbarButton from "../toolbar/ToolbarButton";
import TextElement from "../typography/Text";
import ToolbarDivider from "../toolbar/ToolbarDivider";
import alignLeftIcon from "../../assets/icons/alignLeft.svg";
import alignCenterIcon from "../../assets/icons/alignCenter.svg";
import alignRightIcon from "../../assets/icons/alignRight.svg";
import fontSizeDownIcon from "../../assets/icons/fontSizeDown.svg";
import fontSizeUpIcon from "../../assets/icons/fontSizeUp.svg";
import { TextAlignment } from "../../utils/system/text";

const TextToolEditor : Component = () => {
    let input! : HTMLTextAreaElement;
    const textTool = toolbox.getTool<TextTool>(TextTool);
    const [selectedItem, setSelectedItem] = createSignal<Text | null>(null);
    // const [textAlignment, setTextAlignment] = createSignal<TextAlignment>(TextAlignment.Left);
    // const [fontSize, setFontSize] = createSignal(16);

    const calculateSize = () : void => {
        const item = selectedItem();
        if (!item)
            return;
        item.calculateRect();
        const rect = viewport.viewportToScreenRect(item.rect);
        input.style.fontSize = px(viewport.pixelsToViewport(item.fontSize));
        input.style.textAlign = (["left", "center", "right"] as const)[item.alignment];
        input.style.width = px(Math.ceil(rect.w) ?? 0);
        input.style.height = px(Math.ceil(rect.h) ?? 0);
    };

    const onTextItemSelected = (item : Text | null) : void => {
        if (!item)
            return;
        setSelectedItem(item);
        // setTextAlignment(item.alignment);
        // setFontSize(item.fontSize);
        calculateSize();
        input.focus();
    };

    onMount(() => {
        if (textTool)
            textTool.onTextItemSelected.add(onTextItemSelected);

        viewport.onZoom.add(calculateSize);
    });

    onCleanup(() => {
        if (textTool)
            textTool.onTextItemSelected.remove(onTextItemSelected);
        viewport.onZoom.remove(calculateSize);
    });

    return (
        <Show when={toolbox.state.selectedTool === textTool && selection.state.items()[0] && selectedItem()} keyed>
            {(item) => (
                <div
                    class={styles.selectionBox}
                    style={{
                        left: px(selection.state.screenRect()?.x ?? 0),
                        top: px(selection.state.screenRect()?.y ?? 0),
                        width: px(selection.state.screenRect()?.w ?? 0),
                        height: px(selection.state.screenRect()?.h ?? 0),
                    }}
                >
                    <Motion.div
                        initial={{ y: 30, opacity: 0, pointerEvents: "none" }}
                        animate={{ y: 0, opacity: 1, transition: quickEaseInTransition }}
                    >
                        <Panel size="s" class={styles.toolbar}>
                            <Toolbar variant="transparent">
                                <Tooltip content={<TextElement content="actions.textAlignLeft" size="s" uppercase bold as="span" />} orientation="vertical" variant="panel" offset={5}>
                                    <ToolbarButton icon={alignLeftIcon} onClick={() => { item.alignment = TextAlignment.Left; calculateSize(); }} />
                                </Tooltip>
                                <Tooltip content={<TextElement content="actions.textAlignCenter" size="s" uppercase bold as="span" />} orientation="vertical" variant="panel" offset={5}>
                                    <ToolbarButton icon={alignCenterIcon} onClick={() => { item.alignment = TextAlignment.Center; calculateSize(); }} />
                                </Tooltip>
                                <Tooltip content={<TextElement content="actions.textAlignRight" size="s" uppercase bold as="span" />} orientation="vertical" variant="panel" offset={5}>
                                    <ToolbarButton icon={alignRightIcon} onClick={() => { item.alignment = TextAlignment.Right; calculateSize(); }} />
                                </Tooltip>
                                <ToolbarDivider orientation="vertical" />
                                <Tooltip content={<TextElement content="actions.fontSizeDown" size="s" uppercase bold as="span" />} orientation="vertical" variant="panel" offset={5}>
                                    <ToolbarButton icon={fontSizeDownIcon} onClick={() => { item.fontSize = Math.max(item.fontSize / 2, 1); calculateSize(); }} />
                                </Tooltip>
                                <Tooltip content={<TextElement content="actions.fontSizeUp" size="s" uppercase bold as="span" />} orientation="vertical" variant="panel" offset={5}>
                                    <ToolbarButton icon={fontSizeUpIcon} onClick={() => { item.fontSize = Math.min(item.fontSize * 2, 128); calculateSize(); }} />
                                </Tooltip>
                            </Toolbar>
                        </Panel>
                    </Motion.div>

                    <textarea
                        ref={input}
                        class={styles.textArea}
                        style={{
                            left: px(selection.state.screenRect()?.x ?? 0),
                            top: px(selection.state.screenRect()?.y ?? 0),
                            color: Color.UIntToHex(item.color),
                            "font-size": px(viewport.pixelsToViewport(item.fontSize)),
                            "text-align": (["left", "center", "right"] as const)[item.alignment],
                            padding: px(viewport.pixelsToViewport(10)),
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                textTool?.finalize(input.value, item.alignment, item.fontSize);
                                setSelectedItem(null);
                            }
                        }}
                        onInput={(e) => {
                            item.text = (e.target as HTMLTextAreaElement).value;
                            calculateSize();
                            selection.refresh();
                        }}
                        onChange={(e) => {
                            textTool?.finalize((e.target as HTMLTextAreaElement).value, item.alignment, item.fontSize);
                            setSelectedItem(null);
                        }}
                    >{(item).text}</textarea>
                </div>
            )}
        </Show>
    );
};

export default TextToolEditor;
