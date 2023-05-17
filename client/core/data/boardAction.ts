import Rect from "./geometry/rect";
import { BoardItem } from "./item";

export enum BoardActionType
{
    None,
    Add,
    Remove,
    Move,
    Scale,
    Order,
    LockState,
    Label,
    Color,
    Weight,
}

export interface BoardMoveData {
    ids : number[];
    dx : number;
    dy : number;
}

export interface BoardResizeData {
    ids : number[];
    oldRect : Rect;
    newRect : Rect;
}

export interface BoardScaleData {
    ids : number[];
    x : number;
    y : number;
    w : number;
    h : number;
}

export interface BoardOrderData {
    ids : number[];
    direction : number;
}

export interface BoardLockStateData {
    ids : number[];
    state : boolean;
}

export interface BoardLabelData {
    ids : number[];
    label : string | null;
}

export interface BoardStyleData {
    ids : number[];
    value : number;
}

export type BoardAction = (
    { type : BoardActionType.Add; data : BoardItem[] } |
    { type : BoardActionType.Remove; data : number[] } |
    { type : BoardActionType.Move; data : BoardMoveData } |
    { type : BoardActionType.Scale; data : BoardScaleData } |
    { type : BoardActionType.Order; data : BoardOrderData } |
    { type : BoardActionType.LockState; data : BoardLockStateData } |
    { type : BoardActionType.Label; data : BoardLabelData } |
    { type : BoardActionType.Color; data : BoardStyleData } |
    { type : BoardActionType.Weight; data : BoardStyleData }
);

export interface BoardEvent {
    by : string;
    action : BoardAction;
}
