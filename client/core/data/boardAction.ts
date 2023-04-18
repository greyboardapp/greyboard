import { BoardItem } from "./item";

export enum BoardActionType
{
    None,
    Add,
    Remove,
    Move,
    Scale
}

export interface BoardMoveAndScaleAction {
    ids : string[];
    dx : number;
    dy : number;
}

export type BoardAction = { by : string } & (
    { type : BoardActionType.Add; data : Iterable<BoardItem> } |
    { type : BoardActionType.Remove; data : Iterable<string> } |
    { type : BoardActionType.Move | BoardActionType.Scale; data : Iterable<BoardMoveAndScaleAction> }
)
