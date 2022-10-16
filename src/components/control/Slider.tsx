import { Component, Show } from "solid-js";
import { clamp, floor } from "../../utils/system/math";

import styles from "./Slider.module.scss";

interface SliderProps {
    model : [() => number, (v : number) => void];
    min ?: number;
    max ?: number;
    step ?: number;
    showValue ?: boolean;
    onChange ?: (e : Event) => void;
}

const Slider : Component<SliderProps> = (props) => (
    <div class={styles.slider}>
        <input
            type="range"
            min={props.min}
            max={props.max}
            step={props.step}
            value={props.model[0]()}
            onInput={(e) => props.model[1]((e.target as HTMLInputElement).valueAsNumber)}
        />
        <Show when={props.showValue}>
            <input
                type="number"
                min={props.min}
                max={props.max}
                value={props.model[0]()}
                onChange={(e) => {
                    const target = e.target as HTMLInputElement;
                    props.model[1](clamp(floor(target.valueAsNumber, props.step), props.min ?? 0, props.max ?? 100));
                    target.blur();
                }}
            />
        </Show>
    </div>
);

export default Slider;
