import { createSignal } from "solid-js";
import { makeComponentMetaFromVariants, makeStoryVariant, makeStoryVariants } from "../../utils/dom/storybook";
import Slider, { SliderVariants } from "./Slider";

const [value, setValue] = createSignal(0);

export default makeComponentMetaFromVariants(SliderVariants, "Control/Slider");

export const Default = makeStoryVariant(Slider, {
    model: [value, setValue],
    min: 0,
    max: 100,
    step: 1,
    showValue: false,
    disabled: false,
});

export const Disabled = makeStoryVariant(Slider, {
    model: [value, setValue],
    disabled: true,
});

export const WithValue = makeStoryVariant(Slider, {
    model: [value, setValue],
    showValue: true,
});

export const Variants = makeStoryVariants(Slider, SliderVariants, {
    model: [value, setValue],
});
