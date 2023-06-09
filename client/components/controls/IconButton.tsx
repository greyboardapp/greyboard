import { Component, Show } from "solid-js";
import { cva, VariantProps } from "class-variance-authority";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./IconButton.module.scss";
import loadingIcon from "../../assets/icons/loading.svg";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import { cls } from "../../utils/dom/dom";

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
        disabled: false,
    },
});

interface ButtonProps extends GenericProps<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
    icon : SVGIcon;
    onClick ?: (e : MouseEvent) => void;
}

const IconButton : Component<ButtonProps> = (props) => (
    <button
        {...getGenericProps(props)}
        class={cls(buttonStyles(props), props.class)}
        disabled={props.disabled ?? false}
        onClick={(e) => (props.onClick && props.onClick(e))}
    >
        <Show when={props.loading} fallback={<Icon icon={props.icon} />}>
            <Icon icon={loadingIcon} class={styles.loadingIcon} />
        </Show>
    </button>
);

export default IconButton;
export { ButtonVariants };
