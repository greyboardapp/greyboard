import { Component, createSignal, For, Show } from "solid-js";
import { Motion, Presence } from "@motionone/solid";
import { Rerun } from "@solid-primitives/keyed";
import ToolbarButton from "./ToolbarButton";
import { ToolCategory } from "../../core/services/toolbox/tool";
import { toolbox } from "../../core/services/toolbox";

import styles from "./ToolbarPopup.module.scss";
import Toolbar from "./Toolbar";
import { quickEaseOutTransition, quickEaseInTransition } from "../../utils/motion";

interface ToolbarPopupProps {
    category : ToolCategory;
}

const ToolbarPopup : Component<ToolbarPopupProps> = (props) => {
    const isActive = () : boolean => !!toolbox.state.selectedTool && props.category.tools.includes(toolbox.state.selectedTool);
    const [open, setOpen] = createSignal(false);

    return (
        <div
            class={styles.toolbarPopupActuator}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <Rerun on={props.category.lastUsedTool}>
                <ToolbarButton
                    icon={props.category.lastUsedTool.icon}
                    active={toolbox.state.selectedTool && props.category.tools.includes(toolbox.state.selectedTool)}
                    tooltip={{ orientation: "right", text: props.category.lastUsedTool.name, shortcut: props.category.lastUsedTool.shortcut }}
                    onClick={() => (toolbox.state.selectedTool = props.category.lastUsedTool)}
                />
            </Rerun>
            <Presence>
                <Show when={isActive() && open()}>
                    <Motion.div
                        class={styles.toolbarPopup}
                        initial={{ scale: 0.75, opacity: 0, transformOrigin: "left center" }}
                        animate={{ scale: 1, opacity: 1, transition: quickEaseInTransition }}
                        exit={{ scale: 0.75, opacity: 0, transition: quickEaseOutTransition }}
                    >
                        <Toolbar class={styles.toolbarPopupContent} variant="floating">
                            <For each={props.category.tools}>
                                {(tool) => <ToolbarButton
                                    icon={tool.icon}
                                    active={toolbox.state.selectedTool === tool}
                                    tooltip={{ orientation: "top", text: tool.name, shortcut: tool.shortcut }}
                                    onClick={() => (toolbox.state.selectedTool = props.category.lastUsedTool = tool)}
                                />}
                            </For>
                        </Toolbar>
                    </Motion.div>
                </Show>
            </Presence>
        </div>
    );
};

export default ToolbarPopup;
