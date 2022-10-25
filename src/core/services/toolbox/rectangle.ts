import Rect from "../../data/geometry/rect";
import Rectangle from "../../data/items/rectangle";
import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData, Shortcut } from "../input";
import { toolbox } from "../toolbox";

import rectangleIcon from "../../../assets/icons/rectangle.svg";
import { viewport } from "../viewport";

export class RectangleTool extends CreatorTool<Rectangle> {
    constructor() {
        super({
            name: "tools.rectangle",
            icon: rectangleIcon,
            shortcut: new Shortcut("R"),
        });
    }

    new() : Rectangle {
        return new Rectangle(new Rect(), toolbox.state.selectedColor(), viewport.pixelsToViewport(toolbox.state.selectedWeight), false);
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
