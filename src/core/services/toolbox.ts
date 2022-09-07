import Color from "../../utils/system/color";
import { createService, Service } from "../../utils/system/service";
import { Tool } from "./toolbox/tool";
import Graphics from "./renderer/graphics";
import { dynamicRenderer } from "./renderer";
import { input, PointerEventData } from "./input";
import { RectangleTool } from "./toolbox/rectangle";

export interface ToolboxState {
    selectedTool ?: Tool;
    selectedColor : number;
    selectedWeight : number;

    selectedHexColor : () => string;
}

export class Toolbox extends Service<ToolboxState> {
    public tools : Tool[] = [];
    public colors : number[] = [];

    constructor() {
        super({
            selectedColor: 0xFFFFFF,
            selectedWeight: 2,
            selectedHexColor: () => Color.UIntToHex(this.state.selectedColor),
        });

        this.tools = [
            new RectangleTool(),
        ];

        this.colors = [
            0xFFFFFF,
        ];
    }

    start() : void {
        [this.state.selectedTool] = this.tools;
        [this.state.selectedColor] = this.colors;

        input.onPointerDown.add(this.pointerDownEvent);
        input.onPointerMove.add(this.pointerMoveEvent);
        input.onPointerUp.add(this.pointerUpEvent);
        dynamicRenderer.onRender.add(this.renderEvent);
    }

    selectTool(tool : Tool) : void {
        const previous = this.state.selectedTool;
        if (previous)
            previous.onDeselected();
        this.state.selectedTool = tool;
        this.state.selectedTool.onSelected(previous);
    }

    private pointerDownEvent(data : PointerEventData) : void {
        if (!this.state.selectedTool)
            return;

        this.state.selectedTool.actionStarted = true;
        this.state.selectedTool.onActionStart(data);
    }

    private pointerMoveEvent(data : PointerEventData) : void {
        if (!this.state.selectedTool || !this.state.selectedTool.actionStarted)
            return;

        this.state.selectedTool.onActionMove(data);
    }

    private pointerUpEvent(data : PointerEventData) : void {
        if (!this.state.selectedTool || !this.state.selectedTool.actionStarted)
            return;

        this.state.selectedTool.actionStarted = false;
        this.state.selectedTool.onActionEnd(data);
    }

    private renderEvent(graphics : Graphics, dt : number) : void {
        this.state.selectedTool?.onRender(graphics, dt);
    }
}

export const toolbox = createService<ToolboxState, Toolbox>(Toolbox);
