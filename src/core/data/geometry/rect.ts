import Point from "./point";

export default class Rect {
    public x2 : number;
    public y2 : number;

    constructor(public x : number = 0, public y : number = 0, w = 0, h = 0) {
        this.x2 = x + w;
        this.y2 = y + h;
    }

    get area() : number {
        return Math.abs(this.w * this.h);
    }

    get center() : Point {
        return new Point(this.x + this.w * 0.5, this.y + this.h * 0.5);
    }

    get w() : number {
        return Math.abs(this.x2 - this.x);
    }

    get h() : number {
        return Math.abs(this.y2 - this.y);
    }

    get topLeft() : Point {
        return new Point(this.x, this.y);
    }

    get topRight() : Point {
        return new Point(this.x2, this.y);
    }

    get bottomRight() : Point {
        return new Point(this.x2, this.y2);
    }

    get bottomLeft() : Point {
        return new Point(this.x, this.y2);
    }

    get min() : Point {
        return this.topLeft;
    }

    get max() : Point {
        return this.bottomRight;
    }

    set center(p : Point) {
        this.x += p.x - this.w * 0.5;
        this.y += p.y - this.h * 0.5;
    }

    set w(value : number) {
        this.x2 = this.x + value;
    }

    set h(value : number) {
        this.y2 = this.y + value;
    }

    set topLeft(p : Point) {
        this.x = p.x;
        this.y = p.y;
    }

    set topRight(p : Point) {
        this.x2 = p.x;
        this.y = p.y;
    }

    set bottomRight(p : Point) {
        this.x2 = p.x;
        this.y2 = p.y;
    }

    set bottomLeft(p : Point) {
        this.x = p.x;
        this.y2 = p.y;
    }

    set min(p : Point) {
        this.topLeft = p;
    }

    set max(p : Point) {
        this.bottomRight = p;
    }

    static fromTwoPoints(a : Point, b : Point) : Rect {
        return new Rect(
            Math.min(a.x, b.x),
            Math.min(a.y, b.y),
            Math.abs(b.x - a.x),
            Math.abs(b.y - a.y),
        );
    }

    static infinite() : Rect {
        const rect = new Rect(-Infinity, -Infinity, 0, 0);
        rect.x2 = rect.y2 = Infinity;
        return rect;
    }

    static invertedInfinite() : Rect {
        const rect = new Rect(Infinity, Infinity, 0, 0);
        rect.x2 = rect.y2 = -Infinity;
        return rect;
    }

    append(rect : Rect) : void {
        this.x = Math.min(this.x, rect.x);
        this.y = Math.min(this.y, rect.y);
        this.x2 = Math.max(this.x2, rect.x2);
        this.y2 = Math.max(this.y2, rect.y2);
    }

    inflate(d : number) : void {
        this.x -= d;
        this.y -= d;
        this.x2 += d;
        this.y2 += d;
    }

    normalize() : void {
        const x = Math.min(this.x, this.x2);
        const y = Math.min(this.y, this.y2);
        const x2 = Math.max(this.x, this.x2);
        const y2 = Math.max(this.y, this.y2);
        this.x = x;
        this.y = y;
        this.x2 = x2;
        this.y2 = y2;
    }

    intersects(other : Rect) : boolean {
        return (!(other.x >= this.x2 || other.x2 <= this.x || other.y >= this.y2 || other.y2 <= this.y));
    }

    copy() : Rect {
        return new Rect(this.x, this.y, this.w, this.h);
    }
}
