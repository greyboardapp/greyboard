import { Component, For, JSX } from "solid-js";
import { cva, VariantProps } from "class-variance-authority";

import styles from "./Select.module.scss";
import { GenericProps, getGenericVariants } from "../../utils/dom/props";
import Popover from "../feedback/Popover";
import Panel from "../surfaces/Panel";
import { List, ListItem } from "../data/List";
import Icon from "../data/Icon";

import CarretIcon from "../../assets/icons/carret.svg";

const SelectVariants = {
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

const selectStyles = cva(styles.select, {
    variants: SelectVariants,
    defaultVariants: {
        size: "m",
        variant: "secondary",
        loading: false,
        fluent: false,
        disabled: false,
    },
});

interface SelectOption {
    content : JSX.Element;
    value : number;
}

interface SelectProps extends GenericProps<HTMLSelectElement>, VariantProps<typeof selectStyles> {
    options : SelectOption[];
    model : [() => number, (v : number) => void];
    onChanged ?: (e : Event) => void;
}

const Select : Component<SelectProps> = (props) => (
    <Popover
        actuator={<div class={styles.select}>
            {props.options[props.model[0]()].content}
            <Icon icon={CarretIcon} />
        </div>}
        orientation={"right"}
    >
        {(close) => (
            <Panel size="s">
                <List>
                    <For each={props.options}>
                        {(option) => (
                            <ListItem onClick={() => {
                                props.model[1](option.value);
                                close();
                            }}>{option.content}</ListItem>
                        )}
                    </For>
                </List>
            </Panel>
        )}
    </Popover>
);

export default Select;
export { SelectVariants };
