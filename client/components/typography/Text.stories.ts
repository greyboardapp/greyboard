import { makeComponentMetaFromVariants, makeStoryVariant, makeStoryVariants } from "../../utils/dom/storybook";
import Text, { TextVariants } from "./Text";

export default makeComponentMetaFromVariants(TextVariants, "Typography / Text");

export const Default = makeStoryVariant(Text, {
    key: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    size: "m",
    uppercase: false,
    faded: false,
    bold: false,
});

export const Variants = makeStoryVariants(Text, TextVariants, {
    key: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
});
