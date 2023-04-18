import { ByteBuffer } from "../../../utils/datatypes/byteBuffer";
import { isPointInRect } from "../../../utils/math/intersections";
import Graphics from "../../services/renderer/graphics";
import Point from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItem, BoardItemType } from "../item";

export default class Image extends BoardItem {
    constructor(public rect : Rect, public img : HTMLImageElement) {
        super(BoardItemType.Image);
    }

    render(graphics : Graphics, isTemporary : boolean) : void {
        graphics.image(this.rect, this.img);
    }

    isInLine(a : Point, b : Point) : boolean {
        return isPointInRect(this.rect, a) || isPointInRect(this.rect, b);
    }

    isInRect(rect : Rect) : boolean {
        return this.rect.intersects(rect);
    }

    getSerializedSize() : number { return super.getSerializedSize() + this.img.src.length + 1; }
    serialize(buffer : ByteBuffer) : ByteBuffer {
        super.serialize(buffer);
        buffer.writeString(this.img.src);
        return buffer;
    }
}
