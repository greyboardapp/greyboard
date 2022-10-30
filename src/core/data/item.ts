import { ByteBuffer } from "../../utils/datatypes/byteBuffer";
import { generateId } from "../../utils/datatypes/id";
import Graphics from "../services/renderer/graphics";
import Point from "./geometry/point";
import Rect from "./geometry/rect";

export enum BoardItemType {
    None = 0,
    Path,
    Rectangle,
    Ellipse,
}

export abstract class BoardItem {
    public id : number = generateId();
    public locked = false;
    public zIndex = 0;
    public label : string | null = null;
    public rect : Rect = new Rect();
    public cell : Rect = new Rect();

    constructor(public type = BoardItemType.None) {}

    // type + locked + zIndex + label + rect
    getSerializedSize() : number { return 1 + 1 + 1 + (this.label !== null ? this.label.length + 1 : 1) + 4 * 4; }
    serialize(buffer : ByteBuffer) : ByteBuffer {
        buffer.writeFormatted("bbb", this.type, this.locked ? 1 : 0, this.zIndex);
        buffer.writeString(this.label || "");
        buffer.writeFormatted("ffff", this.rect.x, this.rect.y, this.rect.w, this.rect.h);
        return buffer;
    }

    abstract render(graphics : Graphics, isTemporary : boolean) : void;
    abstract isInLine(a : Point, b : Point) : boolean;
    abstract isInRect(rect : Rect) : boolean;
}

export abstract class BoardShapeItem extends BoardItem {
    constructor(type = BoardItemType.None, public color = 0xFFFFFFFF, public weight = 1) {
        super(type);
    }

    // base + color + weight
    getSerializedSize() : number { return super.getSerializedSize() + 4 + 1; }
    serialize(buffer : ByteBuffer) : ByteBuffer {
        super.serialize(buffer);
        buffer.writeFormatted("ib", this.color, this.weight);
        return buffer;
    }
}
