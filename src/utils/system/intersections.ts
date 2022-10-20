import Point from "../../core/data/geometry/point";
import Rect from "../../core/data/geometry/rect";

export function areLinesIntersecting(a1 : Point, b1 : Point, a2 : Point, b2 : Point) : boolean {
    const n = ((a1.x - b1.x) * (a2.y - b2.y) - (a1.y - b1.y) * (a2.x - b2.x));
    const t = ((a1.x - a2.x) * (a2.y - b2.y) - (a1.y - a2.y) * (a2.x - b2.x)) / n;
    const u = ((a1.x - b1.x) * (a1.y - a2.y) - (a1.y - b1.y) * (a1.x - a2.x)) / n;

    return ((t >= 0 && t <= 1) && (u >= -1 && u <= 0));
}

export function isPointInRect(rect : Rect, p : Point) : boolean {
    return p.x >= rect.x && p.x <= rect.x2 && p.y >= rect.y && p.y <= rect.y2;
}

export function isPointInEllipse(rect : Rect, p : Point) : boolean {
    const ar = rect.w / rect.h;
    const rc = rect.center;
    const d = ((p.x - rc.x) / ar) ** 2 + (p.y - rc.y) ** 2;
    return d <= (rect.h / 2) ** 2;
}
