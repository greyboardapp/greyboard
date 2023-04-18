import { cva, VariantProps } from "class-variance-authority";
import { Component, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import { clamp, floor } from "../../utils/math/math";
import Input from "./Input";

import styles from "./Slider.module.scss";

const SliderVariants = {
    ...getGenericVariants({}),
    showValue: {
        true: styles.showValue,
    },
    disabled: {
        true: styles.disabled,
    },
};

const sliderStyles = cva(styles.slider, {
    variants: SliderVariants,
    defaultVariants: {
        showValue: false,
        disabled: false,
    },
});

interface SliderProps extends GenericProps<HTMLDivElement>, VariantProps<typeof sliderStyles> {
    id ?: string;
    model : [() => number, (v : number) => void];
    min ?: number;
    max ?: number;
    step ?: number;
    onChange ?: (e : Event) => void;
}

const Slider : Component<SliderProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(sliderStyles(props), props.class)}
    >
        <input
            id={props.id}
            type="range"
            min={props.min}
            max={props.max}
            step={props.step}
            value={props.model[0]()}
            onInput={(e) => props.model[1]((e.target as HTMLInputElement).valueAsNumber)}
            disabled={props.disabled ?? false}
        />
        <Show when={props.showValue}>
            <Input
                model={[props.model[0], (v) => {
                    const value = clamp(floor(typeof v === "number" ? v : parseInt(v, 10), props.step), props.min ?? 0, props.max ?? 100);
                    props.model[1](Number.isNaN(value) ? 0 : value);
                }]}
                size="xs"
                disabled={props.disabled}
            />
        </Show>
    </div>
);

export default Slider;
export { SliderVariants };
