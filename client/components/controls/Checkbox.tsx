import { cva, VariantProps } from "class-variance-authority";
import { Component, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./Checkbox.module.scss";

const CheckboxVariants = {
    ...getGenericVariants({}),
    size: {
        xs: styles.xs,
        s: styles.s,
        m: styles.m,
    },
    disabled: {
        true: styles.disabled,
    },
};

const checkboxStyles = cva(styles.checkbox, {
    variants: CheckboxVariants,
    defaultVariants: {
        size: "m",
        disabled: false,
    },
});

interface CheckboxProps extends GenericProps<HTMLDivElement>, VariantProps<typeof checkboxStyles> {
    id ?: string;
    model : [() => boolean, (v : boolean) => void];
    placeholder ?: string;
    icon ?: SVGIcon;
    onChange ?: (e : Event) => void;
}

const Checkbox : Component<CheckboxProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(checkboxStyles(props), props.class)}
    >
        <Show when={props.size !== "xs" && props.icon} keyed>
            {(icon) => <Icon icon={icon}/>}
        </Show>
        <input
            id={props.id}
            type="checkbox"
            placeholder={props.placeholder ?? ""}
            value={props.model[0]() ? "on" : "off"}
            disabled={props.disabled ?? false}
            onInput={(e) => props.model[1]((e.target as HTMLInputElement).value === "on")}
            onChange={(e) => props.onChange && props.onChange(e)}
            max={3}
        />
    </div>
);

export default Checkbox;
export { CheckboxVariants };
