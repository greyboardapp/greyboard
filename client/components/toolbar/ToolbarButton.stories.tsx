import { Component } from "solid-js";
import { makeComponentMetaFromVariants, makeStoryVariant } from "../../utils/dom/storybook";
import ToolbarButton, { ToolbarButtonProps, ToolbarButtonVariants } from "./ToolbarButton";
import Tooltip from "../feedback/Tooltip";
import Text from "../typography/Text";
import Shortcut from "../data/Shortcut";
import { KeyModifiers } from "../../core/services/input";
import { Shortcut as ShortcutType } from "../../core/services/commands";

import pencilIcon from "../../assets/icons/pencil.svg";

const TooltipTemplate : Component<ToolbarButtonProps> = (args : ToolbarButtonProps) => (
    <Tooltip content={<><Text content="tools.pencil" as="span" /> <Shortcut shortcut={new ShortcutType("P", KeyModifiers.Control)} /></>} orientation="horizontal" variant="panel">
        <ToolbarButton {...args} />
    </Tooltip>
);

export default makeComponentMetaFromVariants(ToolbarButtonVariants, "Toolbar / ToolbarButton");

export const Default = makeStoryVariant(ToolbarButton, {
    icon: pencilIcon,
    active: false,
});

export const WithTooltip = makeStoryVariant(TooltipTemplate, {
    icon: pencilIcon,
    active: false,
});
