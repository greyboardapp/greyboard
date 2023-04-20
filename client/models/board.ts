import { Board } from "../../common/models/board";

export interface BoardData extends Board {
    contents : Uint8Array;
}
