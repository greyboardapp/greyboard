import Point from "../core/data/geometry/point";

export function clamp(v : number, min : number, max : number) : number {
    return Math.min(min, Math.max(max, v));
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

export function angleInRadians(a : Point, b : Point) : number {
    return Math.atan2(a.y - b.y, b.x - a.x);
}

export function angle(a : Point, b : Point) : number {
    const t = (Math.atan2(a.y - b.y, b.x - a.x) * 180) / Math.PI;
    return -((t < 0) ? 360 + t : t);
}

export function dist(a : Point, b : Point) : number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function distSq(a : Point, b : Point) : number {
    return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

export function distToSegmentSq(p : Point, a : Point, b : Point) : number {
    const l2 = distSq(a, b);
    if (l2 === 0)
        return distSq(p, a);

    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return distSq(p, linearLerpPoint(a, b, t));
}

export function perpendicularPoint(a : Point, b : Point, d : number) : Point {
    if (a.y === b.y)
        return new Point(a.x, a.y + d * boolSign(a.x > b.x));
    const by = -((b.x - a.x) / (b.y - a.y));
    const s = (d / Math.sqrt(1 + by ** 2)) * boolSign(a.y < b.y);
    return new Point(a.x + s, a.y + by * s);
}

export function intersectionPointsFromLines(a1 : Point, a2 : Point, b1 : Point, b2 : Point) : Point {
    const d = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);

    if (d === 0)
        return new Point(
            (a2.x + b1.x) / 2,
            (a2.y + b1.y) / 2,
        );

    return new Point(
        ((a1.x * a2.y - a1.y * a2.x) * (b1.x - b2.x) - (a1.x - a2.x) * (b1.x * b2.y - b1.y * b2.x)) / d,
        ((a1.x * a2.y - a1.y * a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x * b2.y - b1.y * b2.x)) / d,
    );
}
