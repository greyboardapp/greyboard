import Rect from "../../data/geometry/rect";
import Rectangle from "../../data/items/rectangle";
import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData, Shortcut } from "../input";
import { toolbox } from "../toolbox";

import rectangleIcon from "../../../assets/icons/rectangle.svg";
import { viewport } from "../viewport";
import Point from "../../data/geometry/point";

export class RectangleTool extends CreatorTool<Rectangle> {
    constructor() {
        super({
            name: "tools.rectangle",
            icon: rectangleIcon,
            shortcut: new Shortcut("R"),
        });
    }

    new() : Rectangle {
        return new Rectangle(new Rect(), toolbox.state.selectedColor(), toolbox.state.selectedWeight, false);
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;
        this.item = this.new();
        this.item.rect.x = data.positions[0].x;
        this.item.rect.y = data.positions[0].y;
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
        const p1 = viewport.screenToViewport(new Point(this.item.rect.x, this.item.rect.y));
        const p2 = viewport.screenToViewport(new Point(this.item.rect.x2, this.item.rect.y2));
        this.item.rect.x = p1.x;
        this.item.rect.y = p1.y;
        this.item.rect.x2 = p2.x;
        this.item.rect.y2 = p2.y;
        super.create();
    }
}
