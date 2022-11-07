import { cva, VariantProps } from "class-variance-authority";
import { Component } from "solid-js";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./ToolbarButton.module.scss";

const ToolbarButtonVariants = {
    active: {
        true: styles.active,
    },
};

const toolbarButtonStyles = cva(styles.toolbarButton, {
    variants: ToolbarButtonVariants,
    defaultVariants: {
        active: false,
    },
});

interface ToolbarButtonProps extends VariantProps<typeof toolbarButtonStyles> {
    icon : SVGIcon;
    disabled ?: boolean;
    onClick ?: (e : MouseEvent) => void;
}

const ToolbarButton : Component<ToolbarButtonProps> = (props) => (
    <button
        class={toolbarButtonStyles(props)}
        disabled={props.disabled}
        onClick={(e) => props.onClick && props.onClick(e)}
    >
        <Icon icon={props.icon} />
    </button>
);

export default ToolbarButton;
export { ToolbarButtonVariants };
export type { ToolbarButtonProps };
