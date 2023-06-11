import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import { Shortcut } from "../commands";

import lineIcon from "../../../assets/icons/line.svg";
import { viewport } from "../viewport";
import Path from "../../data/items/path";

export class LineTool extends CreatorTool<Path> {
    constructor() {
        super({
            name: "tools.line",
            icon: lineIcon,
            shortcut: new Shortcut("L"),
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
        this.item.points.push(data.positions[0]);
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        if (this.item.points.length < 2)
            return;
        [this.item.points[1]] = data.positions;
    }

    onActionEnd(data : PointerEventData) : void {
        this.onActionMove(data);
        this.create();
    }

    create() : void {
        this.item.process();
        this.item.weight = toolbox.state.selectedWeight;
        super.create();
    }
}
