import { Component, ComponentProps } from "solid-js";
import { cls } from "../../utils/dom/dom";

import styles from "./Icon.module.scss";

interface IconProps {
    class ?: string;
    icon : SVGIcon;
}

const Icon : Component<IconProps> = (props) => <props.icon class={cls(props.class, styles.icon)} />;

export type SVGIcon = Component<ComponentProps<"svg">>;
export default Icon;
