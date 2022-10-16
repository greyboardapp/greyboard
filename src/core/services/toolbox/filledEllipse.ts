import Rect from "../../data/geometry/rect";
import { toolbox } from "../toolbox";
import ellipseFilledIcon from "../../../assets/icons/ellipseFilled.svg";
import { KeyModifiers, Shortcut } from "../input";
import { EllipseTool } from "./ellipse";
import Ellipse from "../../data/items/ellipse";

export class FilledEllipseTool extends EllipseTool {
    constructor() {
        super();
        this.name = "tools.filledEllipse";
        this.icon = ellipseFilledIcon;
        this.shortcut = new Shortcut("C", KeyModifiers.Shift);
    }

    new() : Ellipse {
        return new Ellipse(new Rect(), toolbox.state.selectedColor(), toolbox.state.selectedWeight, true);
    }
}
