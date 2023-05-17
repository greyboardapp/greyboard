import { SVGIcon } from "../../../components/data/Icon";
import { BoardItem } from "../../data/item";
import { board } from "../board";
import { PointerEventData } from "../input";
import Graphics from "../renderer/graphics";
import { Shortcut } from "../commands";
import Point from "../../data/geometry/point";
import { selection } from "../selection";
import { isPointInRect } from "../../../utils/math/intersections";
import { viewport } from "../viewport";
import Rect from "../../data/geometry/rect";

export interface ToolCategory {
    name : string;
    tools : Tool[];
    lastUsedTool : Tool;
}

export function makeToolCategory(name : string, ...tools : Tool[]) : ToolCategory {
    const category : ToolCategory = {
        name,
        tools,
        lastUsedTool: tools[0],
    };
    for (const tool of tools)
        tool.category = category;
    return category;
}

export type ToolHierarchy = Array<Tool | ToolCategory>;

export interface ToolDescription {
    name : string;
    icon : SVGIcon;
    shortcut : Shortcut;
}

export class Tool implements ToolDescription {
    public name : string;
    public icon : SVGIcon;
    public shortcut : Shortcut;
    public category ?: ToolCategory;
    public actionStarted = false;

    constructor(description : ToolDescription) {
        this.name = description.name;
        this.icon = description.icon;
        this.shortcut = description.shortcut;
    }

    onSelected(previous ?: Tool) : void {}
    onDeselected() : void {
        this.actionStarted = false;
    }

    onActionStart(data : PointerEventData) : boolean { return true; }
    onActionMove(data : PointerEventData) : void {}
    onActionEnd(data : PointerEventData) : void {}

    onRender(graphics : Graphics, dt : number) : void {}
}

export abstract class CreatorTool<T extends BoardItem> extends Tool {
    protected item! : T;

    constructor(description : ToolDescription) {
        super(description);
    }

    create() : void {
        board.addAction([this.item]);
    }

    onRender(graphics : Graphics, dt : number) : void {
        if (this.actionStarted)
            this.item.render(graphics, true);
    }

    abstract new() : T;
}

export enum ManipulationMode {
    None,
    Select,
    Move,
    Resize,
}

export enum ResizeDirection {
    None = 0,
    ResizeN = 1 << 0,
    ResizeW = 1 << 1,
    ResizeS = 1 << 2,
    ResizeE = 1 << 3,
}

export enum Orientation {
    None,
    Horizontal,
    Vertical,
}

export abstract class ManipulationTool extends Tool {
    public mode = ManipulationMode.None;
    public resizeDirection = ResizeDirection.None;
    protected start = new Point();
    protected end = new Point();
    protected startRect = new Rect();
    protected endRect = new Rect();

    constructor(description : ToolDescription) {
        super(description);
    }

    onActionStart(data : PointerEventData) : boolean {
        [this.start] = [this.end] = data.positions;
        const rect = selection.state.screenRect();
        if (rect) {
            this.resizeDirection = ResizeDirection.None;
            if (isPointInRect(new Rect(rect.x - 5, rect.y - 5, rect.w + 10, 10), this.start))
                this.resizeDirection |= ResizeDirection.ResizeN;
            if (isPointInRect(new Rect(rect.x - 5, rect.y2 - 5, rect.w + 10, 10), this.start))
                this.resizeDirection |= ResizeDirection.ResizeS;
            if (isPointInRect(new Rect(rect.x - 5, rect.y - 5, 10, rect.h + 10), this.start))
                this.resizeDirection |= ResizeDirection.ResizeW;
            if (isPointInRect(new Rect(rect.x2 - 5, rect.y - 5, 10, rect.h + 10), this.start))
                this.resizeDirection |= ResizeDirection.ResizeE;

            if (this.resizeDirection !== ResizeDirection.None) {
                this.mode = ManipulationMode.Resize;
                this.onResizeActionStart();
            } else if (isPointInRect(rect, this.start)) {
                this.mode = ManipulationMode.Move;
                this.onMoveActionStart();
            } else {
                this.mode = ManipulationMode.Select;
            }
        } else {
            this.mode = ManipulationMode.Select;
        }

        return true;
    }

    onMoveActionStart() : boolean {
        selection.removeLockedItems();
        board.removeFromChunk(selection.state.items());
        return true;
    }

    onResizeActionStart() : boolean {
        selection.removeLockedItems();
        board.removeFromChunk(selection.state.items());
        this.startRect = selection.state.rect() ?? new Rect();
        return true;
    }

    onActionMove(data : PointerEventData) : void {
        [this.end] = data.positions;

        if (this.mode === ManipulationMode.Select)
            this.onSelectActionMove();
        else if (this.mode === ManipulationMode.Resize)
            this.onResizeActionMove(data);
        else
            this.onMoveActionMove(
                viewport.viewportToScreenPixels(data.movement[0].x),
                viewport.viewportToScreenPixels(data.movement[0].y),
            );
    }

    onSelectActionMove() : void {
        if (this.start.x === this.end.x && this.start.y === this.end.y) {
            const items = board.getItemsAtPoint(viewport.screenToBoard(this.end));
            const item = items.sort((a, b) => b.zIndex - a.zIndex).last();
            selection.state.ids = item ? [item.id] : [];
        } else {
            this.getSelectedItems();
        }
    }

    onMoveActionMove(dx : number, dy : number) : void {
        for (const item of selection.state.items()) {
            item.rect.x += dx;
            item.rect.y += dy;
            item.rect.x2 += dx;
            item.rect.y2 += dy;
        }
        selection.state.ids = selection.state.ids.copy();
    }

    onResizeActionMove(data : PointerEventData) : void {
        const oldBb = selection.state.rect();
        if (!oldBb)
            return;
        const dx = viewport.viewportToScreenPixels(data.movement[0].x);
        const dy = viewport.viewportToScreenPixels(data.movement[0].y);

        const newBb = new Rect(oldBb.x, oldBb.y, oldBb.w, oldBb.h);

        if ((this.resizeDirection & ResizeDirection.ResizeN) === ResizeDirection.ResizeN) {
            newBb.y += dy;
            if (newBb.h < 10)
                newBb.y = newBb.y2 - 10;
        }
        if ((this.resizeDirection & ResizeDirection.ResizeS) === ResizeDirection.ResizeS) {
            newBb.y2 += dy;
            if (newBb.h < 10)
                newBb.y2 = newBb.y + 10;
        }
        if ((this.resizeDirection & ResizeDirection.ResizeW) === ResizeDirection.ResizeW) {
            newBb.x += dx;
            if (newBb.w < 10)
                newBb.x = newBb.x2 - 10;
        }
        if ((this.resizeDirection & ResizeDirection.ResizeE) === ResizeDirection.ResizeE) {
            newBb.x2 += dx;
            if (newBb.w < 10)
                newBb.x2 = newBb.x + 10;
        }

        if (newBb.w < 10)
            newBb.w = 10;

        if (newBb.h < 10)
            newBb.h = 10;

        for (const item of selection.state.items()) {
            item.rect.x = newBb.x + ((item.rect.x - oldBb.x) / oldBb.w) * newBb.w;
            item.rect.y = newBb.y + ((item.rect.y - oldBb.y) / oldBb.h) * newBb.h;
            item.rect.x2 = newBb.x + ((item.rect.x2 - oldBb.x) / oldBb.w) * newBb.w;
            item.rect.y2 = newBb.y + ((item.rect.y2 - oldBb.y) / oldBb.h) * newBb.h;
        }

        selection.state.ids = selection.state.ids.copy();
    }

    onActionEnd(data : PointerEventData) : void {
        if (this.mode === ManipulationMode.Select)
            this.onSelectActionEnd(data);
        else if (this.mode === ManipulationMode.Move)
            this.onMoveActionEnd();
        else if (this.mode === ManipulationMode.Resize)
            this.onResizeActionEnd();
        this.mode = ManipulationMode.None;
    }

    onSelectActionEnd(data : PointerEventData) : void {
        this.onActionMove(data);
    }

    onMoveActionEnd() : void {
        const dx = viewport.viewportToScreenPixels(this.end.x - this.start.x);
        const dy = viewport.viewportToScreenPixels(this.end.y - this.start.y);

        board.moveAction({ ids: selection.state.ids.copy(), dx, dy }, false);

        board.addToChunk(selection.state.items());
    }

    onResizeActionEnd() : void {
        this.endRect = selection.state.rect() ?? new Rect();

        board.resizeAction({ ids: selection.state.ids.copy(), oldRect: this.startRect, newRect: this.endRect });

        board.addToChunk(selection.state.items());
    }

    onRender(graphics : Graphics, dt : number) : void {
        if (!this.actionStarted)
            return;

        if (this.mode === ManipulationMode.Select)
            this.onSelectRender(graphics, dt);
        else
            this.onMoveRender(graphics, dt);
    }

    private getMouseDragOrientation(dx : number, dy : number) : Orientation {
        return ((dx > dy && -dx > dy) || (dx < dy && -dx < dy)) ? Orientation.Vertical : Orientation.Horizontal;
    }

    abstract getSelectedItems() : void;

    abstract onSelectRender(graphics : Graphics, dt : number) : void;
    abstract onMoveRender(graphics : Graphics, dt : number) : void;
}
