import { Component, For, onCleanup, onMount } from "solid-js";
import { Rerun } from "@solid-primitives/keyed";
import Canvas from "../components/surfaces/Canvas";
import Toolbar from "../components/toolbar/Toolbar";
import ToolbarButton from "../components/toolbar/ToolbarButton";
import app from "../core/app";
import { board } from "../core/services/board";
import ToolbarTitle from "../components/toolbar/ToolbarTitle";
import UserBubble from "../components/data/UserBubble";
import Button from "../components/control/Button";
import { viewport } from "../core/services/viewport";
import { toolbox } from "../core/services/toolbox";

import toolbarStyles from "../components/toolbar/Toolbar.module.scss";

import menuIcon from "../assets/icons/menu.svg";
import saveIcon from "../assets/icons/save.svg";
import exportIcon from "../assets/icons/export.svg";
import deleteIcon from "../assets/icons/delete.svg";
import undoIcon from "../assets/icons/undo.svg";
import redoIcon from "../assets/icons/redo.svg";
// import peopleIcon from "../assets/icons/people.svg";
import paletteIcon from "../assets/icons/palette.svg";

import plusIcon from "../assets/icons/plus.svg";
import minusIcon from "../assets/icons/minus.svg";
import layerIcon from "../assets/icons/layer.svg";
import settingsIcon from "../assets/icons/settings.svg";
import ToolbarText from "../components/toolbar/ToolbarText";
import { Tool } from "../core/services/toolbox/tool";
import ToolbarPopup from "../components/toolbar/ToolbarPopup";
import Slider from "../components/control/Slider";
import ColorPicker from "../components/data/ColorPicker";
import ColorSwatch from "../components/data/ColorSwatch";
import Block from "../components/layout/Block";
import Panel from "../components/surfaces/Panel";
import Text from "../components/typography/Text";
import Grid from "../components/layout/Grid";
import ToolbarDivider from "../components/toolbar/ToolbarDivider";
import { pct } from "../utils/dom/dom";

const IndexPage : Component = () => {
    onMount(() => app.start());
    onCleanup(() => app.stop());

    return (
        <>
            <Canvas />
            <div class="ui">
                <div class="top flex h h-spaced">
                    <Toolbar variant="top">
                        <ToolbarButton icon={menuIcon} />
                        <div class={`${toolbarStyles.toolbarGroup} ${toolbarStyles.shifted} h v-center`}>
                            <ToolbarTitle text={board.state.name} />
                            <ToolbarButton icon={saveIcon} tooltip={{ orientation: "bottom", key: "actions.save" }} />
                            <ToolbarButton icon={exportIcon} tooltip={{ orientation: "bottom", key: "actions.export" }} />
                            <ToolbarButton icon={deleteIcon} tooltip={{ orientation: "bottom", key: "actions.clear" }} />
                            <ToolbarButton icon={undoIcon} tooltip={{ orientation: "bottom", key: "actions.undo" }} />
                            <ToolbarButton icon={redoIcon} tooltip={{ orientation: "bottom", key: "actions.redo" }} />
                        </div>
                    </Toolbar>
                    <div class="flex h">
                        <UserBubble name="Jsdsadfoh Iuds" />
                        {/* <Button icon={peopleIcon} text={"share"} onClick={(e) => console.log(e)} /> */}
                    </div>
                </div>
                <div class="left flex v v-spaced">
                    <Toolbar variant="left">
                        <div class={`${toolbarStyles.toolbarGroup} v`}>
                            <For each={toolbox.state.toolHierarchy}>
                                {(entry) => {
                                    if (entry instanceof Tool)
                                        return (
                                            <ToolbarButton
                                                icon={entry.icon}
                                                active={toolbox.state.selectedTool === entry}
                                                tooltip={{ orientation: "right", key: entry.name, shortcut: entry.shortcut }}
                                                onClick={() => (toolbox.state.selectedTool = entry)} />
                                        );
                                    return (
                                        <ToolbarPopup
                                            origin="center"
                                            active={!!toolbox.state.selectedTool && entry.tools.includes(toolbox.state.selectedTool)}
                                            actuator={
                                                <Rerun on={entry.lastUsedTool}>
                                                    <ToolbarButton
                                                        icon={entry.lastUsedTool.icon}
                                                        active={toolbox.state.selectedTool && entry.tools.includes(toolbox.state.selectedTool)}
                                                        tooltip={{ orientation: "right", key: entry.lastUsedTool.name, shortcut: entry.lastUsedTool.shortcut }}
                                                        onClick={() => (toolbox.state.selectedTool = entry.lastUsedTool)}
                                                    />
                                                </Rerun>
                                            }
                                        >
                                            <Toolbar variant="floating">
                                                <For each={entry.tools}>
                                                    {(tool) => <ToolbarButton
                                                        icon={tool.icon}
                                                        active={toolbox.state.selectedTool === tool}
                                                        tooltip={{ orientation: "top", key: tool.name, shortcut: tool.shortcut }}
                                                        onClick={() => (toolbox.state.selectedTool = entry.lastUsedTool = tool)}
                                                    />}
                                                </For>
                                            </Toolbar>
                                        </ToolbarPopup>
                                    );
                                }}
                            </For>
                            <ToolbarDivider />
                            <ToolbarPopup
                                origin="corner"
                                actuator={<ToolbarButton icon={paletteIcon} />}
                            >
                                <Panel>
                                    <Block>
                                        <Text key="titles.strokeWeight" size="s" uppercase faded bold class="mb1" />
                                        <Slider min={1} max={10} model={[() => toolbox.state.selectedWeight, (v) => (toolbox.state.selectedWeight = v)]} showValue />
                                    </Block>
                                    <Text key="titles.color" size="s" uppercase faded bold class="mb3" />
                                    <Grid class="mb3">
                                        <For each={toolbox.state.colorPalette}>
                                            {(color, index) => (
                                                <ColorSwatch
                                                    // Disabled since we know for a fact that the order of the colors will not change
                                                    // eslint-disable-next-line solid/reactivity
                                                    model={[() => color, (v) => (toolbox.state.selectedColorIndex = index())]}
                                                    active={toolbox.state.selectedColorIndex === index()}
                                                />
                                            )}
                                        </For>
                                    </Grid>
                                    <Block>
                                        <ColorPicker model={[toolbox.state.selectedColor, toolbox.updateSelectedColorValue]} />
                                    </Block>
                                    <Button key="buttons.resetPalette" variant="transparent" fluent onClick={() => toolbox.resetColorPalette()} />
                                </Panel>
                            </ToolbarPopup>
                        </div>
                        <div class={`${toolbarStyles.toolbarGroup} v`}>
                            <ToolbarButton icon={plusIcon} />
                            <ToolbarText text={pct(viewport.state.scale)} />
                            <ToolbarButton icon={minusIcon} />
                            <ToolbarButton icon={layerIcon} />
                            <ToolbarButton icon={settingsIcon} />
                        </div>
                    </Toolbar>
                </div>
                <svg class={toolbarStyles.innerCorner} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0H0V10C0 4.47715 4.47715 0 10 0Z" fill="currentColor"></path>
                </svg>
            </div>
        </>
    );
};

export default IndexPage;
