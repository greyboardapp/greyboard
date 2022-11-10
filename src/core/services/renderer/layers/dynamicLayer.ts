import { board } from "../../board";
import { RendererLayer } from "../../renderer/layer";
import { selection } from "../../selection";
import { toolbox } from "../../toolbox";
import { viewport } from "../../viewport";

export class DynamicLayer extends RendererLayer {
    onRender(dt : number) : void {
        this.graphics.clear();
        for (const id of selection.state.ids) {
            const item = board.items.get(id);
            if (!item)
                continue;
            const rect = viewport.viewportToBoardRect(item.rect);
            this.graphics.rectangle(rect.x + viewport.state.offsetX, rect.y + viewport.state.offsetY, rect.w, rect.h, item.locked ? 0xFF000080 : 0xFFFFFF30, 1, false);
        }

        const tool = toolbox.state.selectedTool;
        if (!tool)
            return;
        tool.onRender(this.graphics, dt);
    }
}
