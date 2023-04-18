import { cva, VariantProps } from "class-variance-authority";
import { Component, ComponentProps } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

import styles from "./Icon.module.scss";

const IconVariants = { ...getGenericVariants({}) };
const iconStyles = cva(styles.icon, {
    variants: IconVariants,
});

interface IconProps extends GenericProps<SVGSVGElement>, VariantProps<typeof iconStyles> {
    class ?: string;
    icon : SVGIcon;
}

const Icon : Component<IconProps> = (props) => <props.icon {...getGenericProps(props)} class={cls(props.class, styles.icon)} />;

export type SVGIcon = Component<ComponentProps<"svg">>;
export default Icon;
