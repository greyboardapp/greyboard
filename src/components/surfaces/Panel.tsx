import { ParentComponent } from "solid-js";

import styles from "./Panel.module.scss";

interface PanelProps {
    title ?: string;
}

const Panel : ParentComponent<PanelProps> = (props) => (
    <div class={styles.panel}>
        <h2>{props.title}</h2>
        {props.children}
    </div>
);

export default Panel;
