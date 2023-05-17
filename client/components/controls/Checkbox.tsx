import { cva, VariantProps } from "class-variance-authority";
import { Component } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

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
    onChange ?: (e : Event) => void;
}

const Checkbox : Component<CheckboxProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(checkboxStyles(props), props.class)}
    >
        <input
            id={props.id}
            type="checkbox"
            placeholder={props.placeholder ?? ""}
            checked={props.model[0]()}
            disabled={props.disabled ?? false}
            onChange={(e) => {
                props.model[1]((e.target as HTMLInputElement).checked);
                if (props.onChange)
                    props.onChange(e);
            }}
        />
    </div>
);

export default Checkbox;
export { CheckboxVariants };
