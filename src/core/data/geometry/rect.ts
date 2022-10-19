import Point from "./point";

export default class Rect {
    constructor(public x : number = 0, public y : number = 0, public w : number = 0, public h : number = 0) {}

    get center() : Point {
        return new Point(this.x + this.w / 2, this.y + this.h / 2);
    }

    get area() : number {
        return Math.abs(this.w * this.h);
    }

    get x2() : number {
        return this.x + this.w;
    }

    get y2() : number {
        return this.y + this.h;
    }

    set x2(value : number) {
        this.w = value - this.x;
    }

    set y2(value : number) {
        this.h = value - this.y;
    }

    static infinite() : Rect {
        return new Rect(-Infinity, -Infinity, Infinity, Infinity);
    }

    static invertedInfinite() : Rect {
        return new Rect(Infinity, Infinity, -Infinity, -Infinity);
    }

    static fromTwoPoints(a : Point, b : Point) : Rect {
        return new Rect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));
    }

    intersects(other : Rect) : boolean {
        return (!(other.x >= this.x2 || other.x2 <= this.x || other.y >= this.y2 || other.y2 <= this.y));
    }
}

export class MinMaxRect {
    constructor(public min : Point = new Point(), public max : Point = new Point()) {}

    get x() : number {
        return this.min.x;
    }

    get x2() : number {
        return this.max.x;
    }

    get y() : number {
        return this.min.y;
    }

    get y2() : number {
        return this.max.y;
    }

    get w() : number {
        return this.max.x - this.min.x;
    }

    get h() : number {
        return this.max.y - this.min.y;
    }

    append(other : MinMaxRect | Rect) : void {
        this.min.x = Math.min(this.min.x, other.x);
        this.min.y = Math.min(this.min.y, other.y);
        this.max.x = Math.max(this.max.x, other.x2);
        this.max.y = Math.max(this.max.y, other.y2);
    }

    toRect() : Rect {
        return new Rect(this.min.x, this.min.y, this.max.x - this.min.x, this.max.y - this.min.x);
    }
}
