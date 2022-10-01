import { Component } from "solid-js";
import Icon, { SVGIcon } from "../data/Icon";

import styles from "./ToolbarButton.module.scss";

interface ToolbarButtonProps {
    icon : SVGIcon;
    active ?: boolean;
    onClick ?: (e : MouseEvent) => void;
}

const ToolbarButton : Component<ToolbarButtonProps> = (props) => (
    <button
        classList={{
            [styles.toolbarButton]: true,
            [styles.active]: props.active,
        }}
        onClick={(e) => props.onClick && props.onClick(e)}
    >
        <Icon icon={props.icon} />
    </button>
);

export default ToolbarButton;
