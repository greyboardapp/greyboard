import { Component, ComponentProps } from "solid-js";

import styles from "./Icon.module.scss";

interface IconProps {
    icon : SVGIcon;
}

const Icon : Component<IconProps> = (props) => <i class={styles.icon}><props.icon /></i>;

export type SVGIcon = Component<ComponentProps<"svg">>;
export default Icon;
