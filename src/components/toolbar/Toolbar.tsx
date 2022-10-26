import { ParentComponent } from "solid-js";
import { cls } from "../../utils/dom/dom";

import styles from "./Toolbar.module.scss";

interface ToolbarProps {
    variant : "top" | "left" | "floating";
    class ?: string;
}

const Toolbar : ParentComponent<ToolbarProps> = (props) => (
    <div
        class={cls(styles.toolbar, styles[props.variant], props.class)}
    >
        {props.children}
    </div>
);

export default Toolbar;
