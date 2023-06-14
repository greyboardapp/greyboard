import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import Path from "../../data/items/path";
import { Shortcut } from "../commands";

import markerIcon from "../../../assets/icons/marker.svg";
import { viewport } from "../viewport";
import Color from "../../../utils/datatypes/color";

export class MarkerTool extends CreatorTool<Path> {
    constructor() {
        super({
            name: "tools.marker",
            icon: markerIcon,
            shortcut: new Shortcut("M"),
        });
    }

    new() : Path {
        const c = Color.UIntToRGBA(toolbox.state.selectedColor());
        return new Path([], Color.RGBAToUInt(c[0], c[1], c[2], c[3] * 0.5), viewport.pixelsToViewport(toolbox.state.selectedWeight * 4));
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
        this.item.weight = toolbox.state.selectedWeight * 4;
        super.create();
    }
}
