import { cva, VariantProps } from "class-variance-authority";
import { Component } from "solid-js";
import Color from "../../utils/datatypes/color";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

import styles from "./ColorSwatch.module.scss";

const ColorSwatchVariants = {
    ...getGenericVariants({}),
    active: {
        true: styles.active,
    },
};

const colorSwatchStyles = cva(styles.colorSwatch, {
    variants: ColorSwatchVariants,
    defaultVariants: {
        active: false,
    },
});

interface ColorSwatchProps extends GenericProps<HTMLDivElement>, VariantProps<typeof colorSwatchStyles> {
    model : [() => number, (v : number) => void];
}

const ColorSwatch : Component<ColorSwatchProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(colorSwatchStyles(props), props.class)}
        style={{
            "background-color": Color.UIntToHex(props.model[0]()),
        }}
        onClick={() => props.model[1](props.model[0]())}
    ></div>
);

export default ColorSwatch;
