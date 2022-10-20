import { Tool } from "./tool";

import boxSelectIcon from "../../../assets/icons/boxSelect.svg";
import { PointerEventData, Shortcut } from "../input";
import Graphics from "../renderer/graphics";
import Point from "../../data/geometry/point";
import Rect from "../../data/geometry/rect";
import { board } from "../board";
import { toolbox } from "../toolbox";
import { viewport } from "../viewport";

export class BoxSelectTool extends Tool {
    private start = new Point();
    private end = new Point();

    constructor() {
        super({
            name: "tools.boxSelect",
            icon: boxSelectIcon,
            shortcut: new Shortcut("s"),
        });
    }

    onSelected(previous ?: Tool | undefined) : void {
    }

    onActionStart(data : PointerEventData) : boolean {
        [this.start] = [this.end] = data.positions;
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        [this.end] = data.positions;

        const rect = Rect.fromTwoPoints(viewport.screenToViewport(this.start), viewport.screenToViewport(this.end));
        const items = board.getItemsWithinRect(rect);
        toolbox.state.selectedItemIds = items.filter((item) => !item.locked && item.isInRect(rect)).map((item) => item.id);
    }

    onActionEnd(data : PointerEventData) : void {
        this.onActionMove(data);
    }

    onRender(graphics : Graphics, dt : number) : void {
        if (!this.actionStarted)
            return;

        graphics.rect(Rect.fromTwoPoints(this.start, this.end), 0xFFFFFF30, 0, true);
    }
}
