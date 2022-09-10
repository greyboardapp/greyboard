import { CreatorTool, ToolCategory } from "./tool";
import { PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import Path from "../../data/items/path";

export class PencilTool extends CreatorTool<Path> {
    constructor() {
        super({
            name: "Pencil",
            icon: "",
            category: ToolCategory.Shapes,
        });
    }

    new() : Path {
        return new Path([], toolbox.state.selectedColor, toolbox.state.selectedWeight, true);
    }

    onActionStart(data : PointerEventData) : void {
        this.item = this.new();
        this.item.points.push(data.positions[0]);
    }

    onActionMove(data : PointerEventData) : void {
        this.item.points.push(data.positions[0]);
    }

    onActionEnd(data : PointerEventData) : void {
        this.item.points.push(data.positions[0]);

        this.item.process();
        this.create();
    }
}
