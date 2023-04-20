import Rect from "./geometry/rect";
import { BoardItem } from "./item";

export enum BoardActionType
{
    None,
    Add,
    Remove,
    Move,
    Scale
}

export interface BoardMoveData {
    ids : Iterable<number>;
    dx : number;
    dy : number;
}

export interface BoardResizeData {
    ids : Iterable<number>;
    oldRect : Rect;
    newRect : Rect;
}

export interface BoardScaleData {
    ids : Iterable<number>;
    x : number;
    y : number;
    w : number;
    h : number;
}

export type BoardAction = { by : string } & (
    { type : BoardActionType.Add; data : Iterable<BoardItem> } |
    { type : BoardActionType.Remove; data : Iterable<number> } |
    { type : BoardActionType.Move; data : BoardMoveData } |
    { type : BoardActionType.Scale; data : BoardScaleData }
)
