export function pass<T>(v : T) : void {}

export function throwError<T, E extends Error>(e : E) : T {
    throw e;
}

export async function wait(ms : number) : Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function isInRange(v : number, min : number, max : number) : boolean {
    return v >= min && v <= max;
}

export function getInitials(str : string) : string {
    return str.replace(/[a-z ]/g, "");
}

export type ObjectRecord<T> = Record<keyof T, T[keyof T]>

export function omitProperty<T extends {[key : PropertyKey] : unknown}, K extends PropertyKey>(obj : T, prop : K) : Omit<T, K> {
    const { [prop]: removed, ...result } = obj;
    return result;
}

export function queryString(obj : {[key : string] : unknown}) : string {
    return Object.entries(obj).map(([key, value]) => `${key}=${value}`).join("&");
}
