import { AuthType } from "./authType";

export interface User {
    id : string;
    name : string;
    email : string;
    avatar : string;
    type : AuthType;
}
