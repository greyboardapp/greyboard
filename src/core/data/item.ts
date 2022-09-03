import { generateId } from "../../utils/system/id";
import Graphics from "../graphics";
import Rect, { MinMaxRect } from "./geometry/rect";

export enum BoardItemType {
    None = 0,
    Path,
    Rectangle,
}

export abstract class BoardItem {
    public id : number = generateId();
    public type : BoardItemType = BoardItemType.None;
    public rect : Rect = new Rect();
    public cell : MinMaxRect = new MinMaxRect();
    public color = 0xFFFFFFFF;
    public label : string | null = null;
    public locked = false;
    public zIndex = 0;

    abstract render(graphics : Graphics) : void;
}
