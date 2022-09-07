import { BoardItem } from "../../data/item";
import { board } from "../board";
import { PointerEventData } from "../input";
import Graphics from "../renderer/graphics";

export class ToolCategory {
    public static Shapes = new ToolCategory("Shapes");
    public static Controls = new ToolCategory("Controls");

    public lastUsedTool : Tool | null = null;
    constructor(public name : string) {}

    get icon() : string {
        return this.lastUsedTool?.icon || "";
    }
}

export interface ToolDescription {
    name : string;
    icon : string;
    category : ToolCategory;
}

export class Tool implements ToolDescription {
    public name : string;
    public icon : string;
    public category : ToolCategory;
    public actionStarted = false;

    constructor(description : ToolDescription) {
        this.name = description.name;
        this.icon = description.icon;
        this.category = description.category;
    }

    onSelected(previous ?: Tool) : void {}
    onDeselected() : void {}

    onActionStart(data : PointerEventData) : void {}
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
        board.add([this.item]);
    }

    onRender(graphics : Graphics, dt : number) : void {
        if (this.actionStarted)
            this.item.render(graphics);
    }

    abstract new() : T;
}
