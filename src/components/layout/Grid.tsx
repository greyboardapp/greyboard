import { ParentComponent } from "solid-js";
import { cls } from "../../utils/dom/dom";

import styles from "./Grid.module.scss";

interface GridProps {
    class ?: string;
}

const Grid : ParentComponent<GridProps> = (props) => (
    <div class={cls(styles.grid, props.class)}>{props.children}</div>
);

export default Grid;
