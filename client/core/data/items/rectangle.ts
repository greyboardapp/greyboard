import { ByteBuffer } from "../../../utils/datatypes/byteBuffer";
import { isPointInRect } from "../../../utils/math/intersections";
import Graphics from "../../services/renderer/graphics";
import Point from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItemType, BoardShapeItem } from "../item";

export default class Rectangle extends BoardShapeItem {
    constructor(public rect : Rect, color : number, weight : number, public filled : boolean = false) {
        super(BoardItemType.Rectangle, color, weight);
    }

    async render(graphics : Graphics, isTemporary : boolean) : Promise<void> {
        graphics.rect(this.rect, this.color, this.weight, this.filled);
    }

    isInLine(a : Point, b : Point) : boolean {
        const isAIn = isPointInRect(this.rect, a);
        const isBIn = isPointInRect(this.rect, b);

        return (
            (this.filled && (isAIn || isBIn)) ||
            (!this.filled && (isAIn || isBIn) && (isAIn !== isBIn))
        );
    }

    isInRect(rect : Rect) : boolean {
        return this.rect.intersects(rect);
    }

    // base + filled
    getSerializedSize() : number { return super.getSerializedSize() + 1; }
    serialize(buffer : ByteBuffer) : ByteBuffer {
        super.serialize(buffer);
        buffer.writeByte(this.filled ? 1 : 0);
        return buffer;
    }
}
