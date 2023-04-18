import { BasicUser } from "./user";

export interface NetworkClient extends BasicUser {
    pointerX : number;
    pointerY : number;
    afk : boolean;
}
