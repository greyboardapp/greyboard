import { Component, Show } from "solid-js";
import { KeyModifiers } from "../../core/services/input";
import { Shortcut as ShortcutType } from "../../core/services/commands";

import styles from "./Shortcut.module.scss";

interface ShortcutProps {
    shortcut : ShortcutType;
}

const Shortcut : Component<ShortcutProps> = (props) => (
    <div class={styles.shortcut}>
        <Show when={props.shortcut.modifiers & KeyModifiers.Control}>
            <span class={styles.key}>CTRL</span>+
        </Show>
        <Show when={props.shortcut.modifiers & KeyModifiers.Shift}>
            <span class={styles.key}>SHIFT</span>+
        </Show>
        <Show when={props.shortcut.modifiers & KeyModifiers.Alt}>
            <span class={styles.key}>ALT</span>+
        </Show>
        <Show when={props.shortcut.modifiers & KeyModifiers.Meta}>
            <span class={styles.key}>META</span>+
        </Show>
        <span class={styles.key}>{props.shortcut.key}</span>
    </div>
);

export default Shortcut;
