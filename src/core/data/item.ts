import { generateId } from "../../utils/system/id";
import Graphics from "../services/renderer/graphics";
import { viewport } from "../services/viewport";
import Point from "./geometry/point";
import Rect from "./geometry/rect";

export enum BoardItemType {
    None = 0,
    Path,
    Rectangle,
}

export abstract class BoardItem {
    public id : number = generateId();
    public type : BoardItemType = BoardItemType.None;
    public rect : Rect = new Rect();
    public cell : Rect = new Rect();
    public color = 0xFFFFFFFF;
    public label : string | null = null;
    public locked = false;
    public zIndex = 0;

    get transform() : Rect {
        if (viewport.state.scale === 1)
            return this.rect;
        return new Rect(
            this.rect.x * viewport.state.scale,
            this.rect.y * viewport.state.scale,
            this.rect.w * viewport.state.scale,
            this.rect.h * viewport.state.scale,
        );
    }

    abstract render(graphics : Graphics) : void;
    abstract isInLine(a : Point, b : Point) : boolean;
    abstract isInRect(rect : Rect) : boolean;
}
