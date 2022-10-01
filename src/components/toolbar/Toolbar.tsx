import { ParentComponent } from "solid-js";
import { cls } from "../../utils/dom";

import styles from "./Toolbar.module.scss";

interface ToolbarProps {
    variant : "top" | "left" | "floating";
}

const Toolbar : ParentComponent<ToolbarProps> = (props) => (
    <div
        class={cls(styles.toolbar, styles[props.variant])}
    >
        {props.children}
    </div>
);

export default Toolbar;
