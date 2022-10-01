import { Component } from "solid-js";

import styles from "./Toolbar.module.scss";

interface ToolbarTextProps {
    text : string;
}

const ToolbarText : Component<ToolbarTextProps> = (props) => <p class={styles.toolbarText}>{props.text}</p>;

export default ToolbarText;
