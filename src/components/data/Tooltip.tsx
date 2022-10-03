import { Component, Show } from "solid-js";
import { Shortcut } from "../../core/services/input";
import { cls } from "../../utils/dom";

import styles from "./Tooltip.module.scss";

interface TooltipProps {
    text : string;
    orientation : "top" | "right" | "bottom" | "left";
    shortcut ?: Shortcut;
}

const Tooltip : Component<TooltipProps> = (props) => (
    <div class={cls(styles.tooltip, styles[props.orientation])}>
        {props.text}
        <Show when={props.shortcut}>
            {(s) => <span class={styles.shortcut}>{s.toString()}</span>}
        </Show>
    </div>
);

export type { TooltipProps };
export default Tooltip;
