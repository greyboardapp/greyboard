import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData, Shortcut } from "../input";
import { toolbox } from "../toolbox";
import Path from "../../data/items/path";

import pencilIcon from "../../../assets/icons/pencil.svg";

export class PencilTool extends CreatorTool<Path> {
    constructor() {
        super({
            name: "Pencil",
            icon: pencilIcon,
            shortcut: new Shortcut("B"),
        });
    }

    new() : Path {
        return new Path([], toolbox.state.selectedColor, toolbox.state.selectedWeight, true);
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;
        this.item = this.new();
        this.item.points.push(data.positions[0]);
        return true;
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
