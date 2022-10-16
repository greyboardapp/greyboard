import { Component, Show } from "solid-js";
import { getText } from "../../utils/intl";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Button.module.scss";

interface ButtonProps {
    size ?: "small" | "big";
    fluent ?: boolean;
    variant ?: "primary" | "seconday" | "transparent";
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
            [styles[props.variant || "seconday"]]: true,
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
