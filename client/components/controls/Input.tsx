import { cva, VariantProps } from "class-variance-authority";
import { Component, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Input.module.scss";

const InputVariants = {
    ...getGenericVariants({}),
    type: {
        text: "",
        password: "",
    },
    size: {
        xs: styles.xs,
        s: styles.s,
        m: styles.m,
    },
    disabled: {
        true: styles.disabled,
    },
};

const inputStyles = cva(styles.input, {
    variants: InputVariants,
    defaultVariants: {
        type: "text",
        size: "m",
        disabled: false,
    },
});

interface InputProps extends GenericProps<HTMLDivElement>, VariantProps<typeof inputStyles> {
    id ?: string;
    model : [() => string | number, (v : string | number) => void];
    placeholder ?: string;
    icon ?: SVGIcon;
    onChange ?: (e : Event) => void;
}

const Input : Component<InputProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(inputStyles(props), props.class)}
    >
        <Show when={props.size !== "xs" && props.icon} keyed>
            {(icon) => <Icon icon={icon}/>}
        </Show>
        <input
            id={props.id}
            type={props.type ?? "text"}
            placeholder={props.placeholder ?? ""}
            value={props.model[0]()}
            disabled={props.disabled ?? false}
            onInput={(e) => props.model[1]((e.target as HTMLInputElement).value)}
            onChange={(e) => props.onChange && props.onChange(e)}
            max={3}
        />
    </div>
);

export default Input;
export { InputVariants };
