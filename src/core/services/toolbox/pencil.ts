import { CreatorTool } from "./tool";
import { PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import Path from "../../data/items/path";

import pencilIcon from "../../../assets/icons/pencil.svg";

export class PencilTool extends CreatorTool<Path> {
    constructor() {
        super({
            name: "Pencil",
            icon: pencilIcon,
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
