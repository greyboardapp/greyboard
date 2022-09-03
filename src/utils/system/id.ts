import { nanoid } from "nanoid";

export function generateId() : number {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

export function generateStringId() : string {
    return nanoid(8);
}
