import { ManipulationTool } from "./tool";
import Graphics from "../renderer/graphics";
import Rect from "../../data/geometry/rect";
import { Shortcut } from "../commands";
import { viewport } from "../viewport";
import { selection } from "../selection";
import { board } from "../board";

import boxSelectIcon from "../../../assets/icons/boxSelect.svg";

export class BoxSelectTool extends ManipulationTool {
    constructor() {
        super({
            name: "tools.boxSelect",
            icon: boxSelectIcon,
            shortcut: new Shortcut("s"),
        });
    }

    getSelectedItems() : void {
        const rect = viewport.screenToBoardRect(this.start, this.end);
        const vRect = viewport.screenToViewportRect(this.start, this.end);
        const items = board.getItemsWithinRect(rect);
        const ids = items.filter((item) => item.isInRect(vRect)).map((item) => item.id).unique().sort();
        if (!ids.shallowEquals(selection.state.ids))
            selection.state.ids = ids;
    }

    async onSelectRender(graphics : Graphics, dt : number) : Promise<void> {
        graphics.rect(Rect.fromTwoPoints(this.start, this.end), 0xFFFFFF30, 0, true);
    }

    async onMoveRender(graphics : Graphics, dt : number) : Promise<void> {
        graphics.origin(-viewport.state.offsetX, -viewport.state.offsetY);
        graphics.zoom(viewport.state.scale);
        for (const item of selection.state.items())
            await item.render(graphics, false);
        graphics.reset();
    }
}
