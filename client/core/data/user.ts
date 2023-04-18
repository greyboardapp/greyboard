import { AuthType } from "./authType";

export interface BasicUser {
    id : string;
    name : string;
    avatar : string;
}

export interface User extends BasicUser {
    email : string;
    type : AuthType;
}
