import { SVGIcon } from "../../../components/data/Icon";
import { BoardItem } from "../../data/item";
import { board } from "../board";
import { PointerEventData, Shortcut } from "../input";
import Graphics from "../renderer/graphics";

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
