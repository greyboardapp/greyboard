import { Component, Show } from "solid-js";
import { getText } from "../../utils/system/intl";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Button.module.scss";

interface ButtonProps {
    size ?: "small" | "big";
    fluent ?: boolean;
    variant ?: "primary" | "secondary" | "transparent" | "dark";
    icon ?: SVGIcon;
    key : string;
    onClick ?: (e : MouseEvent) => void;
}

const Button : Component<ButtonProps> = (props) => (
    <button
        classList={{
            [styles.button]: true,
            [styles[props.size || "small"]]: true,
            [styles.fluent]: props.fluent,
            [styles[props.variant || "secondary"]]: true,
        }}
        onClick={(e) => (props.onClick && props.onClick(e))}
    >
        <Show when={props.icon}>
            {(icon) => <Icon icon={icon} />}
        </Show>
        {getText(props.key)}
    </button>
);

export default Button;
