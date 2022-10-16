import { Component } from "solid-js";
import Color from "../../utils/system/color";

import styles from "./ColorSwatch.module.scss";

interface ColorSwatchProps {
    model : [() => number, (v : number) => void];
    active ?: boolean;
}

const ColorSwatch : Component<ColorSwatchProps> = (props) => (
    <div
        classList={{
            [styles.colorSwatch]: true,
            [styles.active]: props.active ?? false,
        }}
        style={{
            "background-color": Color.UIntToHex(props.model[0]()),
        }}
        onClick={() => props.model[1](props.model[0]())}
    ></div>
);

export default ColorSwatch;
