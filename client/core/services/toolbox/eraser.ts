import { ModifierTool, Tool } from "./tool";

import eraserIcon from "../../../assets/icons/eraser.svg";
import { PointerEventData } from "../input";
import Point from "../../data/geometry/point";
import { BoardItem, BoardShapeItem } from "../../data/item";
import Graphics from "../renderer/graphics";
import { board } from "../board";
import { viewport } from "../viewport";
import { Shortcut } from "../commands";
import Color from "../../../utils/datatypes/color";

export class EraserTool extends ModifierTool {
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
        this.itemsToDelete.clear();
        [this.pointerPosition] = data.positions;
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        const pp = viewport.screenToViewport(this.pointerPosition);
        const p = viewport.screenToViewport(data.positions[0]);
        const items = board.getItemsWithinRect(viewport.screenToBoardRect(this.pointerPosition, data.positions[0]));
        for (const item of items) {
            if (item.locked)
                continue;

            if (item.isInLine(pp, p)) {
                if (item instanceof BoardShapeItem) {
                    const c = Color.UIntToRGBA(item.color);
                    item.color = Color.RGBAToUInt(c[0], c[1], c[2], c[3] * 0.5);
                }
                this.itemsToDelete.push(item);
                board.remove([item]);
            }
        }
        [this.pointerPosition] = data.positions;
    }

    onActionEnd(data : PointerEventData) : void {
        const items = this.itemsToDelete.copy();
        for (const item of items)
            if (item instanceof BoardShapeItem) {
                const c = Color.UIntToRGBA(item.color);
                item.color = Color.RGBAToUInt(c[0], c[1], c[2], Math.min(c[3] * 2, 255));
            }

        board.removeAction(items);
        this.tail.clear();
        this.itemsToDelete.clear();
    }

    async onRender(graphics : Graphics, dt : number) : Promise<void> {
        if (!this.actionStarted)
            return;

        const count = (1 / dt) * 0.1;
        if (this.tail.length > count)
            this.tail.shift();
        this.tail.push(this.pointerPosition);

        graphics.curve(this.tail, 0xFFFFFF80, 4);

        graphics.origin(-viewport.state.offsetX, -viewport.state.offsetY);
        graphics.zoom(viewport.state.scale);
        for (const item of this.itemsToDelete)
            item.render(graphics, false);
        graphics.reset();
    }
}
