import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import { Shortcut } from "../commands";

import arrowIcon from "../../../assets/icons/arrow.svg";
import { viewport } from "../viewport";
import Path from "../../data/items/path";
import { angleInRadians } from "../../../utils/math/geometry";
import { PressurePoint } from "../../data/geometry/point";

export class ArrowTool extends CreatorTool<Path> {
    private weight = 0;

    constructor() {
        super({
            name: "tools.arrow",
            icon: arrowIcon,
            shortcut: new Shortcut("A"),
        });
    }

    new() : Path {
        this.weight = viewport.pixelsToViewport(toolbox.state.selectedWeight);
        return new Path([], toolbox.state.selectedColor(), this.weight);
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;
        this.item = this.new();
        this.item.points.push(data.positions[0]);
        this.item.points.push(new PressurePoint(data.positions[0].x, data.positions[0].y, data.positions[0].pressure));
        this.item.points.push(new PressurePoint(data.positions[0].x, data.positions[0].y, Math.min((data.positions[0].pressure ?? 0.2) + 0.3, 1)));
        this.item.points.push(new PressurePoint(data.positions[0].x, data.positions[0].y, Math.min((data.positions[0].pressure ?? 0.2) + 0.3, 1)));
        this.item.points.push(new PressurePoint(data.positions[0].x, data.positions[0].y, data.positions[0].pressure));
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        if (!this.item || this.item.points.length < 5)
            return;
        [this.item.points[1]] = [this.item.points[4]] = data.positions;

        const a = angleInRadians(this.item.points[0], this.item.points[1]);
        this.item.points[2].x = this.item.points[1].x + Math.cos(-a + Math.PI * 0.85) * this.weight * 10;
        this.item.points[2].y = this.item.points[1].y + Math.sin(-a + Math.PI * 0.85) * this.weight * 10;
        this.item.points[3].x = this.item.points[1].x + Math.cos(-a + Math.PI * 1.15) * this.weight * 10;
        this.item.points[3].y = this.item.points[1].y + Math.sin(-a + Math.PI * 1.15) * this.weight * 10;
    }

    onActionEnd(data : PointerEventData) : void {
        this.onActionMove(data);
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
