import Point from "../../core/data/geometry/point";
import { linearLerpPoint, boolSign } from "./math";

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
