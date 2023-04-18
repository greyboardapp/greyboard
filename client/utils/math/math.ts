import Point from "../../core/data/geometry/point";

export function clamp(v : number, min : number, max : number) : number {
    return Math.min(max, Math.max(min, v));
}

export function floor(v : number, precision = 1) : number {
    const d = 1 / precision;
    return Math.floor((v + Number.EPSILON) * d) / d;
}

export function round(v : number, precision = 1) : number {
    const d = 1 / precision;
    return Math.round((v + Number.EPSILON) * d) / d;
}

export function ceil(v : number, precision = 1) : number {
    const d = 1 / precision;
    return Math.ceil((v + Number.EPSILON) * d) / d;
}

export function random(min = 0, max = 1) : number {
    return Math.random() * (max - min) + min;
}

export function boolSign(v : boolean) : number {
    return v ? 1 : -1;
}

export function linearLerp(a : number, b : number, t : number) : number {
    return a + t * (b - a);
}

export function linearLerpPoint(a : Point, b : Point, t : number) : Point {
    return new Point(
        a.x + t * (b.x - a.x),
        a.y + t * (b.y - a.y),
    );
}

export function quadraticLerp(a : number, b : number, c : number, t : number) : number {
    return (1 - t) ** 2 * a + 2 * (1 - t) * t * b + t ** 2 * c;
}

export function quadraticLerpPoint(a : Point, b : Point, c : Point, t : number) : Point {
    return new Point(
        (1 - t) ** 2 * a.x + 2 * (1 - t) * t * b.x + t ** 2 * c.x,
        (1 - t) ** 2 * a.y + 2 * (1 - t) * t * b.y + t ** 2 * c.y,
    );
}
