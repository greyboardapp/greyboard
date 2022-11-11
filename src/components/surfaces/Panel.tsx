import { cva, VariantProps } from "class-variance-authority";
import { ParentComponent, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import Title from "../typography/Title";

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
        <Show when={props.title} keyed>
            {(title) => <Title content={title} size="s" />}
        </Show>
        {props.children}
    </div>
);

export default Panel;
