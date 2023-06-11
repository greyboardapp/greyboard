import Rect from "../../data/geometry/rect";
import { CreatorTool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import { Shortcut } from "../commands";

import textIcon from "../../../assets/icons/text.svg";
import { viewport } from "../viewport";
import Text from "../../data/items/text";
import createDelegate from "../../../utils/datatypes/delegate";
import { selection } from "../selection";
import { board } from "../board";
import { TextAlignment } from "../../../utils/system/text";

export class TextTool extends CreatorTool<Text> {
    public onTextItemSelected = createDelegate<[item : Text | null]>();
    public originalText = "";
    public originalAlignment = 0;
    public originalFontSize = 0;

    constructor() {
        super({
            name: "tools.text",
            icon: textIcon,
            shortcut: new Shortcut("T"),
        });
    }

    new() : Text {
        return new Text(new Rect(), 16, toolbox.state.selectedColor(), "", TextAlignment.Left);
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;

        return true;
    }

    onActionEnd(data : PointerEventData) : void {
        if (this.item)
            this.onDeselected();
        const items = board.getItemsAtPoint(viewport.screenToBoard(data.positions[0])).filter((item) => (item instanceof Text)) as Text[];
        if (items.length > 0 && !items[0].locked) {
            [this.item] = items;
        } else {
            this.item = this.new();
            this.item.rect.x = this.item.rect.x2 = data.positions[0].x;
            this.item.rect.y = this.item.rect.y2 = data.positions[0].y;
            this.create();
        }

        this.originalText = this.item.text;
        this.originalAlignment = this.item.alignment;
        this.originalFontSize = this.item.fontSize;
        this.item.calculateRect();

        selection.clear();
        selection.state.ids = [this.item.id];
        board.removeFromChunk([this.item]);
        this.onTextItemSelected(this.item);
    }

    onDeselected() : void {
        this.finalize(this.item.text, this.item.alignment, this.item.fontSize);
    }

    finalize(text : string, alignment : TextAlignment, fontSize : number) : void {
        if (this.originalText !== text || this.originalAlignment !== alignment || this.originalFontSize !== fontSize)
            board.setTextAction({
                item: this.item,
                oldState: {
                    text: this.originalText,
                    alignment: this.originalAlignment,
                    fontSize: this.originalFontSize,
                },
                newState: {
                    text,
                    alignment,
                    fontSize,
                },
            });
        if (text.trim().length === 0)
            board.remove([this.item]);
        else
            board.addToChunk(selection.state.items());

        selection.clear();
    }

    create() : void {
        this.item.rect.normalize();
        const { max } = this.item.rect;
        this.item.rect.min = viewport.screenToViewport(this.item.rect.min);
        this.item.rect.max = viewport.screenToViewport(max);
        super.create();
    }
}
