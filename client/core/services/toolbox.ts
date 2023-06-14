import imageCompression from "browser-image-compression";
import Color from "../../utils/datatypes/color";
import { batched, createService, detached, reactive, Service } from "../../utils/system/service";
import { makeToolCategory, ModifierTool, Tool, ToolHierarchy } from "./toolbox/tool";
import { input, KeyboardEventData, MouseButton, PointerEventData } from "./input";
import { PencilTool } from "./toolbox/pencil";
import { ViewTool } from "./toolbox/view";
import { RectangleTool } from "./toolbox/rectangle";
import { FilledRectangleTool } from "./toolbox/filledRectangle";
import { FilledEllipseTool } from "./toolbox/filledEllipse";
import { EllipseTool } from "./toolbox/ellipse";
import { EraserTool } from "./toolbox/eraser";
import { BoxSelectTool } from "./toolbox/boxSelect";
import { board } from "./board";
import { ByteBuffer } from "../../utils/datatypes/byteBuffer";
import { pass } from "../../utils/system/misc";
import { createCommand } from "./commands";
import { selection } from "./selection";
import { MarkerTool } from "./toolbox/marker";
import { loadImage, toDataUrl } from "../../utils/system/image";
import Image from "../data/items/image";
import { viewport } from "./viewport";
import Rect from "../data/geometry/rect";
import { LineTool } from "./toolbox/line";
import { ArrowTool } from "./toolbox/arrow";
import { TextTool } from "./toolbox/text";

export interface ToolboxState {
    toolHierarchy : ToolHierarchy;
    colorPalette : number[];
    selectedColorIndex : number;
    selectedTool ?: Tool;
    previousSelectedTool ?: Tool;
    selectedWeight : number;
    isToolInAction : boolean;

    selectedColor : () => number;
    selectedHexColor : () => string;
}

export class Toolbox extends Service<ToolboxState> {
    public tools : Tool[];

    constructor() {
        super({
            toolHierarchy: [
                new BoxSelectTool(),
                makeToolCategory("Writing",
                    new PencilTool(),
                    new MarkerTool()),
                new EraserTool(),
                new ViewTool(),
                makeToolCategory("Shapes",
                    new FilledRectangleTool(),
                    new RectangleTool(),
                    new FilledEllipseTool(),
                    new EllipseTool(),
                    new LineTool(),
                    new ArrowTool()),
                new TextTool(),
            ],
            colorPalette: [],
            selectedColorIndex: 0,
            selectedWeight: 2,
            isToolInAction: false,
            selectedColor: () => this.state.colorPalette[this.state.selectedColorIndex],
            selectedHexColor: () => Color.UIntToHex(this.state.selectedColor()),
        });

        this.resetColorPalette();
        this.tools = this.state.toolHierarchy.flatMap((entry) => ((entry instanceof Tool) ? [entry] : entry.tools));
    }

    @reactive
    @batched
    onSelectedToolChanged(prev ?: Tool) : Tool | undefined {
        if (prev) {
            prev.onDeselected();
            this.state.previousSelectedTool = prev;
        }
        if (!this.state.selectedTool?.name.match(/(select|view)/i))
            selection.state.ids = [];
        if (this.state.selectedTool && this.state.selectedTool.category)
            for (const entry of this.state.toolHierarchy)
                if (!(entry instanceof Tool) && entry.name === this.state.selectedTool.category.name)
                    entry.lastUsedTool = this.state.selectedTool;
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
    }

    getTool<T extends Tool>(toolType : new (...args : any[]) => T) : T | null {
        return (this.tools.find((tool) => tool instanceof toolType) as T) ?? null;
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
        input.onKeyDown.add(this.keyDownEvent);
        input.onKeyUp.add(this.keyUpEvent);

        for (const tool of this.tools)
            createCommand(tool.shortcut, () => (this.state.selectedTool = tool));
    }

    async pasteFromClipboard(data : DataTransfer) : Promise<void> {
        try {
            if (data.items.length === 0 || !board.canModify())
                return;
            const item = data.items[0];
            if (item.type.startsWith("text")) {
                const buffer = ByteBuffer.decode(data.getData("text"));
                const items = await board.deserialize(buffer, false);
                for (const i of items) {
                    i.rect.x += 10;
                    i.rect.y += 10;
                    i.rect.x2 += 10;
                    i.rect.y2 += 10;
                }
                board.addAction(items);
                selection.state.ids = items.map((i) => i.id);
            } else if (item.type.startsWith("image")) {
                const blob = item.getAsFile();
                if (!blob)
                    return;
                const compressedBlob = await imageCompression(blob, {
                    alwaysKeepResolution: true,
                    maxSizeMB: 1,
                });
                const blobData = await toDataUrl(URL.createObjectURL(compressedBlob));
                if (!blobData)
                    return;
                const imageData = await loadImage(blobData as string);
                const center = viewport.screenCenterToViewport();
                const image = new Image(new Rect(center.x - imageData.width / 2, center.y - imageData.height / 2, imageData.width, imageData.height), imageData);
                board.addAction([image]);
            }
        } catch (e) { pass(e); }
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
            this.state.isToolInAction = true;
        }

        if ((!(this.state.selectedTool instanceof ModifierTool) || board.canModify()) && this.state.selectedTool.onActionStart(data)) {
            this.state.selectedTool.actionStarted = true;
            this.state.isToolInAction = true;
        }
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
        this.state.isToolInAction = false;
        this.state.selectedTool.onActionEnd(data);
    }

    private keyDownEvent(data : KeyboardEventData) : void {
        if (data.button !== " " || data.repeatCount > 1)
            return;

        const viewTool = this.getTool(ViewTool);
        if (!viewTool)
            return;
        this.state.selectedTool = viewTool;
    }

    private keyUpEvent(data : KeyboardEventData) : void {
        if (!this.state.previousSelectedTool || data.button !== " ")
            return;

        this.state.selectedTool = this.state.previousSelectedTool;
    }
}

export const toolbox = createService<ToolboxState, Toolbox>(Toolbox);
