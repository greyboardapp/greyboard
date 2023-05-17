import { cva, VariantProps } from "class-variance-authority";
import { Component } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

import styles from "./Switch.module.scss";

const SwitchVariants = {
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

const switchStyles = cva(styles.switch, {
    variants: SwitchVariants,
    defaultVariants: {
        size: "s",
        disabled: false,
    },
});

interface SwitchProps extends GenericProps<HTMLDivElement>, VariantProps<typeof switchStyles> {
    id ?: string;
    model : [() => boolean, (v : boolean) => void];
    placeholder ?: string;
    onChange ?: (e : Event) => void;
}

const Switch : Component<SwitchProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(switchStyles(props), props.class)}
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

export default Switch;
export { SwitchVariants };
