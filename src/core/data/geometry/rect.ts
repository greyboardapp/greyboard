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
}

export class MinMaxRect {
    constructor(public min : Point = new Point(), public max : Point = new Point()) {}

    append(other : MinMaxRect) : void {
        this.min.x = Math.min(this.min.x, other.min.x);
        this.min.y = Math.min(this.min.y, other.min.y);
        this.max.x = Math.max(this.max.x, other.max.x);
        this.max.y = Math.max(this.max.y, other.max.y);
    }

    toRect() : Rect {
        return new Rect(this.min.x, this.min.y, this.max.x - this.min.x, this.max.y - this.min.x);
    }
}
