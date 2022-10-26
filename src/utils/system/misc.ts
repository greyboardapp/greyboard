export function pass<T>(v : T) : void {}

export function isInRange(v : number, min : number, max : number) : boolean {
    return v >= min && v <= max;
}

export function getInitials(str : string) : string {
    return str.replace(/[a-z]/g, "");
}
