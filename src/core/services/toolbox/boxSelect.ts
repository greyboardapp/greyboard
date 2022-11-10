import { Tool } from "./tool";

import boxSelectIcon from "../../../assets/icons/boxSelect.svg";
import { PointerEventData } from "../input";
import Graphics from "../renderer/graphics";
import Point from "../../data/geometry/point";
import Rect from "../../data/geometry/rect";
import { board } from "../board";
import { viewport } from "../viewport";
import { Shortcut } from "../commands";
import { selection } from "../selection";

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

        if (this.start.x === this.end.x && this.start.y === this.end.y) {
            const items = board.getItemsAtPoint(viewport.screenToBoard(this.end));
            const item = items.sort((a, b) => b.zIndex - a.zIndex).last();
            selection.state.ids = item ? [item.id] : [];
        } else {
            const rect = viewport.screenToBoardRect(this.start, this.end);
            const items = board.getItemsWithinRect(rect);
            // BUG: isInRect not working when zooming
            const ids = items.filter((item) => item.isInRect(rect)).map((item) => item.id).sort();
            if (!ids.shallowEquals(selection.state.ids))
                selection.state.ids = ids;
        }
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
