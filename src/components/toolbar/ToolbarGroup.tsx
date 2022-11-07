import { cva, VariantProps } from "class-variance-authority";
import { ParentComponent } from "solid-js";

import styles from "./ToolbarGroup.module.scss";

const ToolbarGroupVariants = {
    variant: {
        horizontal: styles.horizontal,
        vertical: styles.vertical,
    },
};

const toolbarGroupStyles = cva(styles.toolbarGroup, {
    variants: ToolbarGroupVariants,
    defaultVariants: {
        variant: "horizontal",
    },
});

interface ToolbarGroupProps extends VariantProps<typeof toolbarGroupStyles> {
    class ?: string;
}

const ToolbarGroup : ParentComponent<ToolbarGroupProps> = (props) => (
    <div class={toolbarGroupStyles(props)}>
        {props.children}
    </div>
);
export default ToolbarGroup;
