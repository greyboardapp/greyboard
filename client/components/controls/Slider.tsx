import { cva, VariantProps } from "class-variance-authority";
import { Component, Show, createSignal } from "solid-js";
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
    onChange ?: (e : Event, newValue : number, oldValue : number) => void;
}

const Slider : Component<SliderProps> = (props) => {
    const [originalValue, setOriginalValue] = createSignal(0);
    return (
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
                onFocus={(e) => setOriginalValue((e.target as HTMLInputElement).valueAsNumber)}
                onInput={(e) => props.model[1]((e.target as HTMLInputElement).valueAsNumber)}
                onChange={(e) => props.onChange && props.onChange(e, (e.target as HTMLInputElement).valueAsNumber, originalValue())}
                disabled={props.disabled ?? false}
            />
            <Show when={props.showValue}>
                <Input
                    model={[props.model[0], (v) => {
                        const value = clamp(floor(typeof v === "number" ? v : parseInt(v, 10), props.step), props.min ?? 0, props.max ?? 100);
                        props.model[1](Number.isNaN(value) ? 0 : value);
                    }]}
                    onChange={(e, newValue, oldValue) => {
                        newValue = clamp(floor(typeof newValue === "number" ? newValue : parseInt(newValue, 10), props.step), props.min ?? 0, props.max ?? 100);
                        oldValue = clamp(floor(typeof oldValue === "number" ? oldValue : parseInt(oldValue, 10), props.step), props.min ?? 0, props.max ?? 100);

                        return props.onChange && props.onChange(e, Number.isNaN(newValue) ? 0 : newValue, Number.isNaN(oldValue) ? 0 : oldValue);
                    }}
                    size="xs"
                    disabled={props.disabled}
                />
            </Show>
        </div>
    );
};

export default Slider;
export { SliderVariants };
