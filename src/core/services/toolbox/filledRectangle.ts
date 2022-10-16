import Rect from "../../data/geometry/rect";
import Rectangle from "../../data/items/rectangle";
import { toolbox } from "../toolbox";
import { RectangleTool } from "./rectangle";
import rectangleFilledIcon from "../../../assets/icons/rectangleFilled.svg";
import { KeyModifiers, Shortcut } from "../input";

export class FilledRectangleTool extends RectangleTool {
    constructor() {
        super();
        this.name = "tools.filledRectangle";
        this.icon = rectangleFilledIcon;
        this.shortcut = new Shortcut("R", KeyModifiers.Shift);
    }

    new() : Rectangle {
        return new Rectangle(new Rect(), toolbox.state.selectedColor(), toolbox.state.selectedWeight, true);
    }
}
