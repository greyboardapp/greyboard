import { Component, Show, Signal } from "solid-js";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Input.module.scss";

interface InputProps {
    model : Signal<string>;
    type ?: "text" | "password";
    placeholder ?: string;
    icon ?: SVGIcon;
    onChange ?: (e : Event) => void;
}

const Input : Component<InputProps> = (props) => (
    <div class={styles.input}>
        <Show when={props.icon}>
            {(icon) => <Icon icon={icon}/>}
        </Show>
        <input
            type={props.type ?? "text"}
            placeholder={props.placeholder ?? ""}
            value={props.model[0]()}
            onInput={(e) => props.model[1]((e.target as HTMLInputElement).value)}
            onChange={(e) => props.onChange && props.onChange(e)}
            max={3}
        />
    </div>
);

export default Input;
