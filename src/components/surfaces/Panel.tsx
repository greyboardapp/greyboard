import { cva, VariantProps } from "class-variance-authority";
import { ParentComponent } from "solid-js";
import { cls } from "../../utils/dom/dom";

import styles from "./Panel.module.scss";

const PanelVariants = {
    size: {
        s: styles.s,
        m: styles.m,
    },
};

const panelStyles = cva(styles.panel, {
    variants: PanelVariants,
    defaultVariants: {
        size: "m",
    },
});

interface PanelProps extends VariantProps<typeof panelStyles> {
    title ?: string;
    class ?: string;
}

const Panel : ParentComponent<PanelProps> = (props) => (
    <div class={cls(panelStyles(props), props.class)}>
        <h2>{props.title}</h2>
        {props.children}
    </div>
);

export default Panel;
