import { makeComponentMetaFromVariants, makeStoryVariant, makeStoryVariants } from "../../utils/dom/storybook";
import { TextVariants } from "./Text";
import Title from "./Title";

export default makeComponentMetaFromVariants(TextVariants, "Typography / Title");

export const Default = makeStoryVariant(Title, {
    key: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    size: "m",
    uppercase: false,
    faded: false,
    bold: true,
});

export const Variants = makeStoryVariants(Title, TextVariants, {
    key: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
});
