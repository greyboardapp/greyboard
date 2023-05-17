import { makeComponentMetaFromVariants, makeStoryVariant } from "../../utils/dom/storybook";
import Shortcut from "./Shortcut";
import { KeyModifiers } from "../../core/services/input";
import { Shortcut as ShortcutType } from "../../core/services/commands";

export default makeComponentMetaFromVariants({}, "Data / Shortcut");

export const Default = makeStoryVariant(Shortcut, {
    shortcut: new ShortcutType("P"),
});

export const Combo = makeStoryVariant(Shortcut, {
    shortcut: new ShortcutType("P", KeyModifiers.Control | KeyModifiers.Shift),
});
