import { cva, VariantProps } from "class-variance-authority";
import { Component, createSignal, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Input.module.scss";
import { getText } from "../../utils/system/intl";

const InputVariants = {
    ...getGenericVariants({}),
    type: {
        text: "",
        password: "",
        email: "",
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
    onChange ?: (e : Event, newValue : string | number, oldValue : string | number) => void;
}

const Input : Component<InputProps> = (props) => {
    const [originalValue, setOriginalValue] = createSignal("");
    return (
        <div
            {...getGenericProps(props)}
            class={cls(inputStyles(props), props.class)}
        >
            <Show when={props.size !== "xs" && props.icon} keyed>
                {(icon) => <Icon icon={icon}/>}
            </Show>
            <input
                id={props.id}
                ref={props.ref as HTMLInputElement}
                type={props.type ?? "text"}
                placeholder={getText(props.placeholder) ?? ""}
                value={props.model[0]()}
                disabled={props.disabled ?? false}
                onFocus={(e) => setOriginalValue((e.target as HTMLInputElement).value)}
                onInput={(e) => props.model[1]((e.target as HTMLInputElement).value)}
                onChange={(e) => props.onChange && props.onChange(e, (e.target as HTMLInputElement).value, originalValue())}
                max={3}
            />
        </div>
    );
};

export default Input;
export { InputVariants };
