import { Component, Show } from "solid-js";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Button.module.scss";

interface ButtonProps {
    size ?: "small" | "big";
    variant ?: "primary" | "seconday" | "transparent";
    icon ?: SVGIcon;
    text : string;
    onClick ?: (e : MouseEvent) => void;
}

const Button : Component<ButtonProps> = (props) => (
    <button
        classList={{
            [styles.button]: true,
            [styles[props.size || "small"]]: true,
            [styles[props.variant || "seconday"]]: true,
        }}
        onClick={(e) => (props.onClick && props.onClick(e))}
    >
        <Show when={props.icon}>
            {(icon) => <Icon icon={icon} />}
        </Show>
        {props.text}
    </button>
);

export default Button;
