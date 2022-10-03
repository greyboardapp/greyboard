import { Motion, Presence } from "@motionone/solid";
import { Component, createSignal, Show } from "solid-js";
import { quickEaseInTransition } from "../../utils/motion";
import Icon, { SVGIcon } from "../data/Icon";
import Tooltip, { TooltipProps } from "../data/Tooltip";

import styles from "./ToolbarButton.module.scss";

interface ToolbarButtonProps {
    icon : SVGIcon;
    active ?: boolean;
    tooltip ?: TooltipProps;
    onClick ?: (e : MouseEvent) => void;
}

const ToolbarButton : Component<ToolbarButtonProps> = (props) => {
    const [tooltipVisible, setTooltipVisible] = createSignal(false);
    return (
        <button
            classList={{
                [styles.toolbarButton]: true,
                [styles.active]: props.active,
            }}
            onClick={(e) => props.onClick && props.onClick(e)}
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
        >
            <Icon icon={props.icon} />
            <Presence>
                <Show when={!props.active && tooltipVisible() && props.tooltip}>
                    {(tooltip) => (
                        <Motion.div
                            class={styles.tooltipRoot}
                            initial={{ scale: 0.75, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ ...quickEaseInTransition, delay: 0.5 }}
                        >
                            <Tooltip orientation={tooltip.orientation} text={tooltip.text} shortcut={tooltip.shortcut} />
                        </Motion.div>
                    )}
                </Show>
            </Presence>
        </button>
    );
};

export default ToolbarButton;
