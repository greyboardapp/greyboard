import { makeComponentMetaFromVariants, makeStoryVariant, makeStoryVariants } from "../../utils/dom/storybook";
import Button, { ButtonVariants } from "./Button";

import peopleIcon from "../../assets/icons/people.svg";

export default makeComponentMetaFromVariants(ButtonVariants, "Controls/Button");

export const Default = makeStoryVariant(Button, {
    content: "Button",
    size: "m",
    variant: "secondary",
    fluent: false,
    disabled: false,
    loading: false,
    loadingProgress: 0,
});

export const Disabled = makeStoryVariant(Button, {
    content: "Button",
    variant: "primary",
    disabled: true,
});

export const WithLanguageText = makeStoryVariant(Button, {
    key: "board.newPlaceholder",
});

export const WithIcon = makeStoryVariant(Button, {
    content: "Button",
    variant: "primary",
    icon: peopleIcon,
});

export const Loading = makeStoryVariant(Button, {
    content: "Button",
    variant: "primary",
    loading: true,
    loadingProgress: 0.75,
});

export const Variants = makeStoryVariants(Button, ButtonVariants, {
    content: "board.newPlaceholder",
});
