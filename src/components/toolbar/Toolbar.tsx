import { cva, VariantProps } from "class-variance-authority";
import { ParentComponent } from "solid-js";

import styles from "./Toolbar.module.scss";

const ToolbarVariants = {
    variant: {
        top: styles.top,
        left: styles.left,
        floating: styles.floating,
        transparent: styles.transparent,
    },
};

const toolbarStyles = cva(styles.toolbar, {
    variants: ToolbarVariants,
    defaultVariants: {
        variant: "floating",
    },
});

interface ToolbarProps extends VariantProps<typeof toolbarStyles> {
    class ?: string;
}

const Toolbar : ParentComponent<ToolbarProps> = (props) => (
    <div class={toolbarStyles(props)}>
        {props.children}
    </div>
);

export default Toolbar;
