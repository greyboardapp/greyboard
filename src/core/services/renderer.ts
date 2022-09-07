import { MinMaxRect } from "../data/geometry/rect";
import { BoardItem } from "../data/item";
import { Board, board } from "./board";
import Graphics from "./renderer/graphics";
import { createStatelessService, Service } from "../../utils/system/service";
import createDelegate from "../../utils/system/delegate";

export class StaticRenderer {
    private readonly graphics : Graphics;

    constructor() {
        const canvas = document.getElementById("staticCanvas") as HTMLCanvasElement;
        this.graphics = new Graphics(canvas);
    }

    render() : void {
        this.graphics.clear("#000000");
        for (const item of board.items.values())
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
            for (const item of board.getItemsFromRegion(region))
                item.render(this.graphics);
        });
    }
}

export class DynamicRenderer extends Service {
    public onRender = createDelegate<[graphics : Graphics, dt : number]>();
    public onResize = createDelegate<[width : number, height : number]>();

    private graphics ?: Graphics;
    private enabled = true;

    constructor() {
        super({});
    }

    start() : void {
        const canvas = document.getElementById("dynamicCanvas") as HTMLCanvasElement;
        this.graphics = new Graphics(canvas, true);

        this.onResize.add(this.resize);

        this.render(0);
    }

    stop() : void {
        this.enabled = false;
        this.onRender.clear();
        this.onResize.clear();
    }

    private resize(width : number, height : number) : void {
        this.graphics?.clear();
    }

    private render(dt : number) : void {
        if (!this.graphics)
            return;

        this.graphics.clear();
        this.onRender(this.graphics, dt);

        if (this.enabled)
            window.requestAnimationFrame((t) => this.render(t));
    }
}

export const dynamicRenderer = createStatelessService(DynamicRenderer);
