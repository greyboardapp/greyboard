import Rect from "../../data/geometry/rect";
import Ellipse from "../../data/items/ellipse";
import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import { Shortcut } from "../commands";

import ellipseIcon from "../../../assets/icons/ellipse.svg";
import { viewport } from "../viewport";

export class EllipseTool extends CreatorTool<Ellipse> {
    constructor() {
        super({
            name: "tools.ellipse",
            icon: ellipseIcon,
            shortcut: new Shortcut("C"),
        });
    }

    new() : Ellipse {
        return new Ellipse(new Rect(), toolbox.state.selectedColor(), viewport.pixelsToViewport(toolbox.state.selectedWeight), false);
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;
        this.item = this.new();
        this.item.rect.x = this.item.rect.x2 = data.positions[0].x;
        this.item.rect.y = this.item.rect.y2 = data.positions[0].y;
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        this.item.rect.x2 = data.positions[0].x;
        this.item.rect.y2 = data.positions[0].y;
    }

    onActionEnd(data : PointerEventData) : void {
        if (this.item.rect.area < 1)
            return;

        this.onActionMove(data);
        this.create();
    }

    create() : void {
        this.item.rect.normalize();
        const { max } = this.item.rect;
        this.item.rect.min = viewport.screenToViewport(this.item.rect.min);
        this.item.rect.max = viewport.screenToViewport(max);
        this.item.weight = toolbox.state.selectedWeight;
        super.create();
    }
}
