import { isPointInRect } from "../../../../utils/system/intersections";
import Rect from "../../../data/geometry/rect";
import { board } from "../../board";
import { QuadTree } from "../../board/chunk";
import { input } from "../../input";
import { RendererLayer } from "../../renderer/layer";
import { viewport } from "../../viewport";

export class DebugLayer extends RendererLayer {
    onRender(dt : number) : void {
        this.graphics.clear();

        for (const chunk of board.chunks.values())
            this.renderQuadTree(chunk);
            // this.renderRect(chunk.boundary, 0x00FF00FF, 3);

        for (const item of board.items.values()) {
            const t = item.transform;
            this.graphics.rectangle(t.x + viewport.state.offsetX, t.y + viewport.state.offsetY, t.w, t.h, 0xFFFFFFFF, 1);
            // this.renderRect(item.rect, 0xFFFFFFFF, 1);
        }

        const bp = viewport.screenToBoard(input.pointerPosition());
        const items = board.getItemsWithinRect(new Rect(bp.x, bp.y, 1, 1));
        for (const item of items) {
            const min = viewport.viewportToScreen(item.rect.min);
            const max = viewport.viewportToScreen(item.rect.max);
            this.graphics.rectangle(min.x, min.y, max.x - min.x, max.y - min.y, 0x00FF00FF, 2);
        }
    }

    renderQuadTree(qt : QuadTree) : void {
        this.graphics.rectangle(qt.boundary.x + viewport.state.offsetX, qt.boundary.y + viewport.state.offsetY, qt.boundary.w, qt.boundary.h, 0xFF0000FF, 2);

        for (const item of qt.items) {
            const min = viewport.viewportToScreen(item.rect.min);
            const max = viewport.viewportToScreen(item.rect.max);
            if (isPointInRect(Rect.fromTwoPoints(min, max), input.pointerPosition()))
                this.graphics.rectangle(qt.boundary.x + viewport.state.offsetX + 10, qt.boundary.y + viewport.state.offsetY + 10, qt.boundary.w - 20, qt.boundary.h - 20, 0x00FF00FF, 2);
        }

        for (const child of qt.children)
            this.renderQuadTree(child);
    }

    renderRect(rect : Rect, color : number, weight = 2, filled = false) : void {
        const min = viewport.viewportToScreen(rect.min);
        const max = viewport.viewportToScreen(rect.max);
        this.graphics.rectangle(
            min.x, min.y,
            max.x - min.x, max.y - min.y,
            color,
            weight,
            filled,
        );
    }
}
