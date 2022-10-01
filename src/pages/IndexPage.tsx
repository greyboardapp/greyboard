import { Component, For, onCleanup, onMount } from "solid-js";
import Canvas from "../components/Canvas";
import Toolbar from "../components/toolbar/Toolbar";
import ToolbarButton from "../components/toolbar/ToolbarButton";
import app from "../core/app";
import { board } from "../core/services/board";
import ToolbarTitle from "../components/toolbar/ToolbarTitle";
import UserBubble from "../components/data/UserBubble";
import Button from "../components/control/Button";
import { viewport } from "../core/services/viewport";
import { getPercentage } from "../utils/system/misc";
import { toolbox } from "../core/services/toolbox";

import toolbarStyles from "../components/toolbar/Toolbar.module.scss";

import menuIcon from "../assets/icons/menu.svg";
import saveIcon from "../assets/icons/save.svg";
import exportIcon from "../assets/icons/export.svg";
import deleteIcon from "../assets/icons/delete.svg";
import undoIcon from "../assets/icons/undo.svg";
import redoIcon from "../assets/icons/redo.svg";
import peopleIcon from "../assets/icons/people.svg";

import plusIcon from "../assets/icons/plus.svg";
import minusIcon from "../assets/icons/minus.svg";
import layerIcon from "../assets/icons/layer.svg";
import settingsIcon from "../assets/icons/settings.svg";
import ToolbarText from "../components/toolbar/ToolbarText";
import { Tool } from "../core/services/toolbox/tool";

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
                        <ToolbarTitle text={board.state.name} />
                        <ToolbarButton icon={saveIcon} />
                        <ToolbarButton icon={exportIcon} />
                        <ToolbarButton icon={deleteIcon} />
                        <ToolbarButton icon={undoIcon} />
                        <ToolbarButton icon={redoIcon} />
                    </Toolbar>
                    <div class="flex h">
                        <UserBubble name="Jsdsadfoh Iuds" />
                        <Button icon={peopleIcon} text={"share"} onClick={(e) => console.log(e)} />
                    </div>
                </div>
                <div class="left flex v v-spaced">
                    <Toolbar variant="left">
                        <div class={`${toolbarStyles.toolbarGroup} v`}>
                            <For each={toolbox.state.toolHierarchy}>
                                {(entry) => <ToolbarButton icon={entry.icon} active={toolbox.state.selectedTool === entry} onClick={() => (entry instanceof Tool) && (toolbox.state.selectedTool = entry)} />
                                    // if (category && tools.length > 1)
                                    //     return <ToolbarButton icon={category.icon} />;
                                    // return (
                                    //     <For each={tools}>
                                    //         {(tool) => <ToolbarButton icon={tool.icon} active={tool.name === toolbox.state.selectedTool?.name} />}
                                    //     </For>
                                    // );
                                }
                            </For>
                        </div>
                        <div class={`${toolbarStyles.toolbarGroup} v`}>
                            <ToolbarButton icon={plusIcon} />
                            <ToolbarText text={getPercentage(viewport.state.scale)} />
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
