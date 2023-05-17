import { nanoid } from "nanoid";
import { floor, random } from "../math/math";

export function generateId() : number {
    return floor(random(0, 4294967295));
}

export function generateStringId() : string {
    return nanoid(8);
}
