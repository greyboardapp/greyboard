import { cva, VariantProps } from "class-variance-authority";
import { Component } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

import styles from "./Divider.module.scss";

const DividerVariants = {
    ...getGenericVariants({}),
    direction: {
        h: styles.h,
        v: styles.v,
    },
};
const dividerStyles = cva(styles.divider, {
    variants: DividerVariants,
});

interface DividerProps extends GenericProps<HTMLDivElement>, VariantProps<typeof dividerStyles> {}

const Divider : Component<DividerProps> = (props) => <div {...getGenericProps(props)} class={cls(props.class, dividerStyles(props))}></div>;

export default Divider;
