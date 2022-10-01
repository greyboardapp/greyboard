import { SVGIcon } from "../../../components/data/Icon";
import { BoardItem } from "../../data/item";
import { board } from "../board";
import { PointerEventData } from "../input";
import Graphics from "../renderer/graphics";

export class ToolCategory {
    public tools : Tool[];
    public icon : SVGIcon;

    constructor(public name : string, ...tools : Tool[]) {
        this.tools = tools;
        for (const tool of this.tools)
            tool.category = this;
        this.icon = this.tools[0].icon;
    }
}

export type ToolHierarchy = Array<Tool | ToolCategory>;

export interface ToolDescription {
    name : string;
    icon : SVGIcon;
}

export class Tool implements ToolDescription {
    public name : string;
    public icon : SVGIcon;
    public category ?: ToolCategory;
    public actionStarted = false;

    constructor(description : ToolDescription) {
        this.name = description.name;
        this.icon = description.icon;
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
