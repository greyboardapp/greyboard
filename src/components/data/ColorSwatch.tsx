import { cva, VariantProps } from "class-variance-authority";
import { Component } from "solid-js";
import Color from "../../utils/datatypes/color";

import styles from "./ColorSwatch.module.scss";

const ColorSwatchVariants = {
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

interface ColorSwatchProps extends VariantProps<typeof colorSwatchStyles> {
    model : [() => number, (v : number) => void];
}

const ColorSwatch : Component<ColorSwatchProps> = (props) => (
    <div
        class={colorSwatchStyles(props)}
        style={{
            "background-color": Color.UIntToHex(props.model[0]()),
        }}
        onClick={() => props.model[1](props.model[0]())}
    ></div>
);

export default ColorSwatch;
