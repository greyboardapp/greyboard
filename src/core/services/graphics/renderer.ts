import { Event, EventConsumer, EventListener } from "../../../utils/system/events";
import { MinMaxRect } from "../../data/geometry/rect";
import { BoardItem } from "../../data/item";
import Board from "../board";
import Graphics from "../../graphics";

export class ResizeEvent extends Event {}

@EventListener
export class StaticRenderer {
    private readonly graphics : Graphics;

    constructor(private readonly board : Board) {
        const canvas = document.getElementById("staticCanvas") as HTMLCanvasElement;
        this.graphics = new Graphics(canvas);
    }

    @EventConsumer(ResizeEvent)
    render() : void {
        this.graphics.clear();
        for (const item of this.board.items.values())
            item.render(this.graphics);
    }

    add(items : Iterable<BoardItem>) : void {
        for (const item of items)
            item.render(this.graphics);
    }

    updateRegion(region : MinMaxRect) : void {
        const w = region.max.x - region.min.x;
        const h = region.max.y - region.min.y;
        this.graphics.scissor(region.min.x * Board.cellSize, region.min.y * Board.cellSize, w * Board.cellSize, h * Board.cellSize, () => {
            for (const item of this.board.getItemsFromRegion(region))
                item.render(this.graphics);
        });
    }
}
