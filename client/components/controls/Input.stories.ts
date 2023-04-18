import { createSignal } from "solid-js";
import { makeComponentMetaFromVariants, makeStoryVariant, makeStoryVariants } from "../../utils/dom/storybook";
import Input, { InputVariants } from "./Input";

import peopleIcon from "../../assets/icons/people.svg";

const [text, setText] = createSignal("");

export default makeComponentMetaFromVariants(InputVariants, "Controls/Input");

export const Default = makeStoryVariant(Input, {
    model: [text, setText],
});

export const Disabled = makeStoryVariant(Input, {
    model: [text, setText],
    disabled: true,
});

export const WithIcon = makeStoryVariant(Input, {
    model: [text, setText],
    icon: peopleIcon,
    size: "m",
    placeholder: "Type here...",
    type: "text",
});

export const Variants = makeStoryVariants(Input, InputVariants, {
    model: [text, setText],
});
