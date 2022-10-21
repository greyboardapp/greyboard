export default class Point {
    constructor(public x : number = 0, public y : number = 0) {}

    get xy() : [number, number] {
        return [this.x, this.y];
    }

    static mid(...points : Point[]) : Point {
        let x = 0; let y = 0;
        for (const point of points) {
            x += point.x;
            y += point.y;
        }
        return new Point(x / points.length, y / points.length);
    }

    inverted() : Point {
        return new Point(-this.x, -this.y);
    }
}

export class PressurePoint extends Point {
    constructor(public x : number = 0, public y : number = 0, public pressure ?: number) {
        super(x, y);
    }
}
