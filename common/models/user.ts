import { Entity } from "./entity";

export enum AuthType {
    Google = 1,
    GitHub = 2,
}

export interface User extends Entity {
    name : string;
    email : string;
    avatar : string;
}

export interface UserDetailed extends User {
    type : AuthType;
    createdAt : number;
}
