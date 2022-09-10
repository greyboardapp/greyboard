import Rect from "../../data/geometry/rect";
import Rectangle from "../../data/items/rectangle";
import { CreatorTool, ToolCategory } from "./tool";
import { PointerEventData } from "../input";
import { toolbox } from "../toolbox";

export class RectangleTool extends CreatorTool<Rectangle> {
    constructor() {
        super({
            name: "Rectangle",
            icon: "",
            category: ToolCategory.Shapes,
        });
    }

    new() : Rectangle {
        return new Rectangle(new Rect(), toolbox.state.selectedColor, toolbox.state.selectedWeight, true);
    }

    onActionStart(data : PointerEventData) : void {
        this.item = this.new();
        this.item.rect.x = data.positions[0].x;
        this.item.rect.y = data.positions[0].y;
    }

    onActionMove(data : PointerEventData) : void {
        this.item.rect.x2 = data.positions[0].x;
        this.item.rect.y2 = data.positions[0].y;
    }

    onActionEnd(data : PointerEventData) : void {
        if (this.item.rect.area < 1)
            return;

        this.create();
    }
}
