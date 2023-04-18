import { Component } from "solid-js";
import Text from "../typography/Text";

import styles from "./ToolbarText.module.scss";

interface ToolbarTextProps {
    content : string;
}

const ToolbarText : Component<ToolbarTextProps> = (props) => <Text content={props.content} size="s" uppercase bold class={styles.toolbarText} />;

export default ToolbarText;
