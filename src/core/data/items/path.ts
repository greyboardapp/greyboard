import { distSq, distToSegmentSq } from "../../../utils/geometry";
import { add, dot, mul, norm, per, rotAround, sub } from "../../../utils/linearAlgebra";
import { areLinesIntersecting, isPointInRect } from "../../../utils/system/intersections";
import { linearLerpPoint } from "../../../utils/system/math";
import Graphics from "../../services/renderer/graphics";
import { viewport } from "../../services/viewport";
import Point, { PressurePoint } from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItem } from "../item";

export default class Path extends BoardItem {
    private static readonly threshold = 0.5;
    private static readonly maxResolution = 5;

    constructor(public points : PressurePoint[], public color : number, public weight : number, public filled : boolean = false) {
        super();
        this.rect = Rect.invertedInfinite();
    }

    process() : void {
        this.optimize();
        this.points = this.points.map((point) => {
            const vp = viewport.screenToViewport(point);
            return new PressurePoint(vp.x, vp.y, point.pressure);
        });
        this.calculateBoundingBox();
    }

    render(graphics : Graphics) : void {
        const points = this.generateStroke();
        graphics.path(new Path2D(this.getSvgPathFromStroke(points)), this.color);
    }

    isInLine(a : Point, b : Point) : boolean {
        for (let i = 0; i < this.points.length - 1; ++i)
            if (areLinesIntersecting(a, b, this.points[i], this.points[i + 1]))
                return true;
        return false;
    }

    isInRect(rect : Rect) : boolean {
        for (const p of this.points)
            if (isPointInRect(rect, p))
                return true;
        return false;
    }

    private calculateBoundingBox() : void {
        for (const point of this.points) {
            if (point.x < this.rect.x)
                this.rect.x = point.x;
            if (point.x > this.rect.w)
                this.rect.w = point.x;
            if (point.y < this.rect.y)
                this.rect.y = point.y;
            if (point.y > this.rect.h)
                this.rect.h = point.y;
        }
        this.rect.w -= this.rect.x;
        this.rect.h -= this.rect.y;
        if (this.rect.w === 0)
            this.rect.w = 1;
        if (this.rect.h === 0)
            this.rect.h = 1;
    }

    private normalize() : void {
        for (const point of this.points) {
            point.x = (point.x - this.rect.x) / this.rect.w;
            point.y = (point.y - this.rect.y) / this.rect.h;
        }
    }

    private optimize() : void {
        const split = (start : number, end : number, result : PressurePoint[] = []) : Point[] => {
            const s = this.points[start];
            const e = this.points[end - 1];
            let maxD = 0;
            let maxI = 1;
            for (let i = start + 1; i < end - 1; ++i) {
                const d = distToSegmentSq(this.points[i], s, e);
                if (d > maxD) {
                    maxD = d;
                    maxI = i;
                }
            }

            if (maxD > Path.threshold) {
                split(start, maxI + 1, result);
                split(maxI, end, result);
            } else {
                if (result.length === 0)
                    result.push(s);
                result.push(e);
            }

            return result;
        };

        const count = this.points.length;
        this.points = split(0, this.points.length);
        if (this.points.length === 2 && this.points[0].x === this.points[1].x && this.points[0].y === this.points[1].y)
            this.points = [this.points[0]];

        console.debug(`Optimized from ${count} to ${this.points.length}. ${this.points.length / count}`);
    }

    private generateStroke() : Point[] {
        if (this.points.length === 0)
            return [];

        const FIXED_PI = Math.PI + 0.0001;
        const left : Point[] = [];
        const right : Point[] = [];

        if (this.points.length === 1) {
            for (let step = 1 / 8, i = 0; i <= 1; i += step) {
                const s = Math.sin(FIXED_PI * i * 2);
                const c = Math.cos(FIXED_PI * i * 2);
                left.push(new Point(this.points[0].x + c * this.weight, this.points[0].y + s * this.weight));
            }
            return left;
        }

        const size = this.weight * 2;
        const minDist = this.weight ** 2;

        if (this.points[0].pressure === undefined)
            this.points[0].pressure = 0.2;

        for (let i = 0; i < this.points.length; ++i) {
            const curr = this.points[i];
            const prev = (i > 0) ? this.points[i - 1] : curr;
            const next = (i < this.points.length - 1) ? this.points[i + 1] : curr;
            const dist = distSq(prev, curr);

            const cv = norm(sub(prev, curr));
            const nv = norm(sub(curr, next));
            const ndot = (i < this.points.length - 1) ? dot(cv, nv) : 1;

            if (curr.pressure === undefined) {
                const sp = Math.min(1, dist / size);
                const pp = prev.pressure ?? 0;
                curr.pressure = Math.min(1, pp + (sp - pp) * (Math.min(1, 1 - sp) * 0.275));
            }
            const radius = size * (0.5 - (0.5 - curr.pressure) / 2);

            if (i > 0 && curr !== next && dot(sub(curr, prev), sub(next, curr)) < 0) {
                const offset = mul(per(cv), radius);
                for (let step = 1 / 13, t = 0; t <= 1; t += step) {
                    left.push(rotAround(sub(curr, offset), curr, FIXED_PI * t));
                    right.push(rotAround(add(curr, offset), curr, FIXED_PI * -t));
                }

                continue;
            }

            const offset = mul(per(linearLerpPoint(nv, cv, ndot)), radius);

            const pl = sub(curr, offset);
            if (i <= 1 || distSq(left[left.length - 1], pl) > minDist)
                left.push(pl);

            const pr = add(curr, offset);
            if (i <= 1 || distSq(right[right.length - 1], pr) > minDist)
                right.push(pr);
        }

        return left.concat(right.reverse());
    }

    private getSvgPathFromStroke(stroke : Point[]) : string {
        if (!stroke.length)
            return "";

        const d = stroke.reduce(
            (acc, p0, i, arr) => {
                const p1 = arr[(i + 1) % arr.length];
                acc.push(p0.x, p0.y, (p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
                return acc;
            },
            ["M", stroke[0].x, stroke[0].y, "Q"],
        );

        d.push("Z");
        return d.join(" ");
    }
}
