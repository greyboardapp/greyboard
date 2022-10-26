import { Component, Show } from "solid-js";
import { Shortcut } from "../../core/services/input";
import { cls } from "../../utils/dom/dom";
import { getText } from "../../utils/system/intl";

import styles from "./Tooltip.module.scss";

interface TooltipProps {
    key : string;
    orientation : "top" | "right" | "bottom" | "left";
    shortcut ?: Shortcut;
}

const Tooltip : Component<TooltipProps> = (props) => (
    <div class={cls(styles.tooltip, styles[props.orientation])}>
        {getText(props.key)}
        <Show when={props.shortcut}>
            {(s) => <span class={styles.shortcut}>{s.toString()}</span>}
        </Show>
    </div>
);

export type { TooltipProps };
export default Tooltip;
