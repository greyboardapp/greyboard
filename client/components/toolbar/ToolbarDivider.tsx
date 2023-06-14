import { Component } from "solid-js";

import { VariantProps, cva } from "class-variance-authority";
import styles from "./ToolbarDivider.module.scss";

const ToolbarDividerVariants = {
    orientation: {
        horizontal: styles.horizontal,
        vertical: styles.vertical,
    },
};

const toolbarDividerStyles = cva(styles.toolbarDivider, {
    variants: ToolbarDividerVariants,
    defaultVariants: {
        orientation: "horizontal",
    },
});

type ToolbarDividerProps = VariantProps<typeof toolbarDividerStyles>

const ToolbarDivider : Component<ToolbarDividerProps> = (props) => <div class={toolbarDividerStyles(props)}></div>;

export default ToolbarDivider;
