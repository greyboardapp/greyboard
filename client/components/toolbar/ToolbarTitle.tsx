import { Component } from "solid-js";

import styles from "./Toolbar.module.scss";

interface ToolbarTitleProps {
    text : string;
}

const ToolbarTitle : Component<ToolbarTitleProps> = (props) => <p class={styles.toolbarTitle}>{props.text}</p>;

export default ToolbarTitle;
