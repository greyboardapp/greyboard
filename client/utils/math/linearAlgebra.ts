import Point from "../../core/data/geometry/point";
import { dist } from "./geometry";

export function neg(p : Point) : Point {
    return new Point(-p.x, -p.y);
}

export function add(a : Point, b : Point) : Point {
    return new Point(a.x + b.x, a.y + b.y);
}

export function sub(a : Point, b : Point) : Point {
    return new Point(a.x - b.x, a.y - b.y);
}

export function mul(a : Point, b : number) : Point {
    return new Point(a.x * b, a.y * b);
}

export function div(a : Point, b : number) : Point {
    return new Point(a.x / b, a.y / b);
}

export function dot(a : Point, b : Point) : number {
    return a.x * b.x + a.y * b.y;
}

export function per(a : Point) : Point {
    return new Point(a.y, -a.x);
}

export function norm(p : Point) : Point {
    const d = dist(new Point(), p);
    if (d === 0)
        return p;
    return new Point(p.x / d, p.y / d);
}

export function rotAround(p : Point, c : Point, a : number) : Point {
    const sin = Math.sin(a);
    const cos = Math.cos(a);

    const px = p.x - c.x;
    const py = p.y - c.y;

    return new Point(c.x + (px * cos - py * sin), c.y + (px * sin + py * cos));
}
