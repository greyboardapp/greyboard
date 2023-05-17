import { Component, Show } from "solid-js";
import { cva, VariantProps } from "class-variance-authority";
import { KeyModifiers } from "../../core/services/input";
import { Shortcut as ShortcutType } from "../../core/services/commands";

import styles from "./Shortcut.module.scss";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import { cls } from "../../utils/dom/dom";

const ShortcutVariants = { ...getGenericVariants({}) };
const shortcutStyles = cva(styles.shortcut, {
    variants: ShortcutVariants,
});

interface ShortcutProps extends GenericProps<HTMLDivElement>, VariantProps<typeof shortcutStyles> {
    shortcut : ShortcutType;
}

const Shortcut : Component<ShortcutProps> = (props) => (
    <div {...getGenericProps(props)} class={cls(styles.shortcut, props.class)}>
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
