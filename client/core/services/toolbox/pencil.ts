import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import Path from "../../data/items/path";
import { Shortcut } from "../commands";

import pencilIcon from "../../../assets/icons/pencil.svg";
import { viewport } from "../viewport";

export class PencilTool extends CreatorTool<Path> {
    constructor() {
        super({
            name: "tools.pencil",
            icon: pencilIcon,
            shortcut: new Shortcut("B"),
        });
    }

    new() : Path {
        return new Path([], toolbox.state.selectedColor(), viewport.pixelsToViewport(toolbox.state.selectedWeight));
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;
        this.item = this.new();
        this.item.points.push(data.positions[0]);
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        if (!this.item)
            return;
        this.item.points.push(data.positions[0]);
    }

    onActionEnd(data : PointerEventData) : void {
        if (!this.item)
            return;
        this.item.points.push(data.positions[0]);

        this.create();
    }

    create() : void {
        if (!this.item)
            return;
        this.item.process();
        this.item.weight = toolbox.state.selectedWeight;
        super.create();
    }
}
