import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "../../../utils/svg";
import { areLinesIntersecting, isPointInRect } from "../../../utils/system/intersections";
import Graphics from "../../services/renderer/graphics";
import { viewport } from "../../services/viewport";
import Point from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItem } from "../item";

export default class Path extends BoardItem {
    constructor(public points : Point[], public color : number, public weight : number, public filled : boolean = false) {
        super();
        this.rect = Rect.invertedInfinite();
    }

    process() : void {
        this.points = this.points.map((point) => viewport.screenToViewport(point));
        this.calculateBoundingBox();
    }

    render(graphics : Graphics) : void {
        graphics.path(new Path2D(getSvgPathFromStroke(getStroke(this.points, {
            size: this.weight * 2,
        }))), this.color);
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
}
