import { ByteBuffer } from "../../../utils/datatypes/byteBuffer";
import { isPointInRect } from "../../../utils/math/intersections";
import { TextAlignment } from "../../../utils/system/text";
import { renderer } from "../../services/renderer";
import Graphics from "../../services/renderer/graphics";
import { DynamicLayer } from "../../services/renderer/layers/dynamicLayer";
import Point from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItemType, BoardShapeItem } from "../item";

export default class Text extends BoardShapeItem {
    private static graphics ?: Graphics;

    constructor(public rect : Rect, public fontSize : number, color : number, public text : string, public alignment : TextAlignment) {
        super(BoardItemType.Text, color, 1);
        if (!Text.graphics)
            Text.graphics = renderer.getLayer<DynamicLayer>(DynamicLayer)?.graphics;
        this.calculateRect();
    }

    calculateRect(fontSize ?: number) : void {
        const lines = this.text.split("\n");
        let width = 4;
        for (const line of lines)
            width = Math.max(width, Text.graphics?.measureText(this.rect, line, this.weight, (fontSize ?? this.fontSize)) ?? line.length * 8);
        this.rect.w = width + 20;

        this.rect.h = Math.max(lines.length, 1) * (fontSize ?? this.fontSize) + 20;
        if (this.rect.h === 0)
            this.rect.h = 36;
    }

    calculateFontSize() : void {
        this.fontSize = (this.rect.h - 20) / Math.max(this.text.split("\n").length, 1);
    }

    onManipulating() : void {
        this.calculateFontSize();
    }

    onResized(oldRect : Rect) : void {
        this.calculateFontSize();
    }

    async render(graphics : Graphics, isTemporary : boolean) : Promise<void> {
        await graphics.text(this.rect, this.text, this.color, this.weight, this.fontSize, this.alignment);
    }

    isInLine(a : Point, b : Point) : boolean {
        return isPointInRect(this.rect, a) || isPointInRect(this.rect, b);
    }

    isInRect(rect : Rect) : boolean {
        return this.rect.intersects(rect);
    }

    // base + filled
    getSerializedSize() : number { return super.getSerializedSize() + 4 + 1 + this.text.length + 1; }
    serialize(buffer : ByteBuffer) : ByteBuffer {
        super.serialize(buffer);
        buffer.writeFloat(this.fontSize);
        buffer.writeByte(this.alignment);
        buffer.writeString(this.text);
        return buffer;
    }
}
