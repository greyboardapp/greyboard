import { Component, Show } from "solid-js";
import { cva, VariantProps } from "class-variance-authority";
import { getText } from "../../utils/system/intl";
import Icon, { SVGIcon } from "../data/Icon";
import { pct } from "../../utils/dom/dom";

import styles from "./Button.module.scss";
import loadingIcon from "../../assets/icons/loading.svg";

const ButtonVariants = {
    size: {
        xs: styles.xs,
        s: styles.s,
        m: styles.m,
    },
    variant: {
        primary: styles.primary,
        secondary: styles.secondary,
        tertiary: styles.tertiary,
    },
    loading: {
        true: styles.loading,
    },
    fluent: {
        true: styles.fluent,
    },
    disabled: {
        true: styles.disabled,
    },
};

const buttonStyles = cva(styles.button, {
    variants: ButtonVariants,
    defaultVariants: {
        size: "m",
        variant: "secondary",
        loading: false,
        fluent: false,
        disabled: false,
    },
});

interface ButtonProps extends VariantProps<typeof buttonStyles> {
    key : string;
    icon ?: SVGIcon;
    onClick ?: (e : MouseEvent) => void;
    loadingProgress ?: number;
}

const Button : Component<ButtonProps> = (props) => (
    <button
        class={buttonStyles(props)}
        disabled={props.disabled ?? false}
        onClick={(e) => (props.onClick && props.onClick(e))}
    >
        <Show when={!props.loading && props.size !== "xs" && props.icon}>
            {(icon) => <Icon icon={icon} />}
        </Show>
        <Show when={props.loading && props.size !== "xs"}>
            <div class={styles.loadingProgress} style={{ width: pct(props.loadingProgress ?? 0) }} ></div>
            <Icon icon={loadingIcon} class={styles.loadingIcon} />
        </Show>
        <span>{getText(props.key)}</span>
    </button>
);

export default Button;
export { ButtonVariants };
