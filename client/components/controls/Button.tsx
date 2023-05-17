import { Component, Show } from "solid-js";
import { cva, VariantProps } from "class-variance-authority";
import Icon, { SVGIcon } from "../data/Icon";
import { cls, pct } from "../../utils/dom/dom";

import styles from "./Button.module.scss";
import loadingIcon from "../../assets/icons/loading.svg";
import Text from "../typography/Text";
import { LanguageTexts } from "../../languages/languages";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

const ButtonVariants = {
    ...getGenericVariants({}),
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

interface ButtonProps extends GenericProps<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
    content : keyof LanguageTexts | string;
    icon ?: SVGIcon;
    onClick ?: (e : MouseEvent) => void;
    to ?: string;
    loadingProgress ?: number;
}

const Button : Component<ButtonProps> = (props) => (
    <button
        {...getGenericProps(props)}
        class={cls(buttonStyles(props), props.class)}
        disabled={props.disabled ?? false}
        onClick={(e) => (props.onClick && props.onClick(e))}
    >
        <Show when={!props.loading && props.size !== "xs" && props.icon} keyed>
            {(icon) => <Icon icon={icon} />}
        </Show>
        <Show when={props.loading && props.size !== "xs"}>
            <div class={styles.loadingProgress} style={{ width: pct(props.loadingProgress ?? 0) }} ></div>
            <Icon icon={loadingIcon} class={styles.loadingIcon} />
        </Show>
        <Text content={props.content} as="span" size="s" bold uppercase />
    </button>
);

export default Button;
export { ButtonVariants };
