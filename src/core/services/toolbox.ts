import Color from "../../utils/system/color";
import { batched, createService, detached, reactive, Service } from "../../utils/system/service";
import { makeToolCategory, Tool, ToolHierarchy } from "./toolbox/tool";
import { input, MouseButton, PointerEventData } from "./input";
import { PencilTool } from "./toolbox/pencil";
import { ViewTool } from "./toolbox/view";
import { RectangleTool } from "./toolbox/rectangle";
import { FilledRectangleTool } from "./toolbox/filledRectangle";
import { FilledEllipseTool } from "./toolbox/filledEllipse";
import { EllipseTool } from "./toolbox/ellipse";

export interface ToolboxState {
    toolHierarchy : ToolHierarchy;
    colorPalette : number[];
    selectedColorIndex : number;
    selectedTool ?: Tool;
    selectedWeight : number;

    selectedColor : () => number;
    selectedHexColor : () => string;
}

export class Toolbox extends Service<ToolboxState> {
    public tools : Tool[];

    constructor() {
        super({
            toolHierarchy: [
                new PencilTool(),
                new ViewTool(),
                makeToolCategory("Shapes",
                    new FilledRectangleTool(),
                    new RectangleTool(),
                    new FilledEllipseTool(),
                    new EllipseTool()),
            ],
            colorPalette: [],
            selectedColorIndex: 0,
            selectedWeight: 2,
            selectedColor: () => this.state.colorPalette[this.state.selectedColorIndex],
            selectedHexColor: () => Color.UIntToHex(this.state.selectedColor()),
        });

        this.resetColorPalette();
        this.tools = this.state.toolHierarchy.flatMap((entry) => ((entry instanceof Tool) ? [entry] : entry.tools));
    }

    @reactive
    @batched
    onSelectedToolChanged(prev ?: Tool) : Tool | undefined {
        if (prev)
            prev.onDeselected();
        this.state.selectedTool?.onSelected(prev);
        return this.state.selectedTool;
    }

    @detached
    private selectToolTemporarily(tool : Tool) : void {
        this.state.selectedTool = tool;
        this.onSelectedToolChanged();
    }

    updateSelectedColorValue(v : number) : void {
        this.state.colorPalette[this.state.selectedColorIndex] = v;
    }

    resetColorPalette() : void {
        this.state.colorPalette = [
            0xFFFFFFFF,
            0x757575FF,
            0xFFEB3BFF,
            0xFF9800FF,
            0xF44336FF,
            0x9C27B0FF,
            0xE0E0E0FF,
            0x212121FF,
            0x4CAF50FF,
            0x009688FF,
            0x2196F3FF,
            0x3F51B5FF,
        ];

        console.log(this.state.colorPalette.map((color) => Color.UIntToHex(color)));
    }

    getTool<T extends Tool>(toolType : new (...args : any[]) => T) : Tool | null {
        return this.tools.find((tool) => tool instanceof toolType) ?? null;
    }

    getToolByName(name : string) : Tool | null {
        return this.tools.find((tool) => tool.name === name) ?? null;
    }

    start() : void {
        this.state.selectedTool = this.getTool(PencilTool) ?? this.tools[0];
        // [this.state.selectedColor] = this.state.colorPalette;

        input.onPointerDown.add(this.pointerDownEvent);
        input.onPointerMove.add(this.pointerMoveEvent);
        input.onPointerUp.add(this.pointerUpEvent);

        for (const tool of this.tools)
            input.registerShortcut(tool.shortcut, () => (this.state.selectedTool = tool));
    }

    private pointerDownEvent(data : PointerEventData) : void {
        if (!this.state.selectedTool)
            return;

        if (data.button === MouseButton.Auxiliary) {
            const viewTool = this.getTool(ViewTool);
            if (!viewTool)
                return;
            if (this.state.selectedTool !== viewTool)
                this.state.selectedTool = viewTool;
            this.state.selectedTool.actionStarted = true;
        }

        if (this.state.selectedTool.onActionStart(data))
            this.state.selectedTool.actionStarted = true;
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
}

export const toolbox = createService<ToolboxState, Toolbox>(Toolbox);
