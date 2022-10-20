import { Tool } from "./tool";

import eraserIcon from "../../../assets/icons/eraser.svg";
import { PointerEventData, Shortcut } from "../input";
import Point from "../../data/geometry/point";
import { BoardItem } from "../../data/item";
import Graphics from "../renderer/graphics";
import { board } from "../board";
import Rect from "../../data/geometry/rect";
import { viewport } from "../viewport";

export class EraserTool extends Tool {
    private pointerPosition = new Point();
    private readonly tail : Point[] = [];
    private readonly itemsToDelete : BoardItem[] = [];

    constructor() {
        super({
            name: "tools.eraser",
            icon: eraserIcon,
            shortcut: new Shortcut("e"),
        });
    }

    onSelected(previous ?: Tool | undefined) : void {
        this.tail.clear();
        this.itemsToDelete.clear();
    }

    onActionStart(data : PointerEventData) : boolean {
        this.tail.clear();
        [this.pointerPosition] = data.positions;
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        const pp = viewport.screenToViewport(this.pointerPosition);
        const p = viewport.screenToViewport(data.positions[0]);
        const items = board.getItemsWithinRect(Rect.fromTwoPoints(pp, p));
        for (const item of items) {
            if (item.locked)
                continue;

            if (item.isInLine(pp, p)) {
                this.itemsToDelete.push(item);
                board.remove([item]);
            }
        }
        [this.pointerPosition] = data.positions;
    }

    onActionEnd(data : PointerEventData) : void {
        this.tail.clear();
        board.removeAction(this.itemsToDelete.copy());
    }

    onRender(graphics : Graphics, dt : number) : void {
        if (!this.actionStarted)
            return;
        if (this.tail.length > 5)
            this.tail.shift();
        this.tail.push(this.pointerPosition);

        graphics.curve(this.tail, 0xFFFFFF80, 4);
    }
}
