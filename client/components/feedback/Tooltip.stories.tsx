import { JSX } from "solid-js";
import { makeComponentMetaFromVariants, makeStoryVariant } from "../../utils/dom/storybook";
import Button from "../controls/Button";
import Tooltip, { TooltipProps, TooltipVariants } from "./Tooltip";

const Template = (props : TooltipProps) : JSX.Element => (
    <Tooltip {...props}>
        <Button key="Hover me" />
    </Tooltip>
);

export default makeComponentMetaFromVariants(TooltipVariants, "Feedback / Tooltip");

export const Default = makeStoryVariant(Template, {
    content: "This is a tooltip",
    variant: "default",
    offset: 0,
});

export const Horizontal = makeStoryVariant(Template, {
    content: "This is a tooltip that is very long and it won't fit",
    variant: "default",
    orientation: "horizontal",
    offset: 0,
});
