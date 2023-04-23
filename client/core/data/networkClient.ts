import { PointerType } from "../services/input";
import { BasicUser } from "./user";

export interface NetworkClient extends BasicUser {
    pointerX : number;
    pointerY : number;
    pointerType : PointerType;
    afk : boolean;
}
