import { isPointInRect } from "../../../utils/system/intersections";
import Graphics from "../../services/renderer/graphics";
import Point from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItem } from "../item";

export default class Rectangle extends BoardItem {
    constructor(public rect : Rect, public color : number, public weight : number, public filled : boolean = false) {
        super();
    }

    render(graphics : Graphics) : void {
        graphics.rect(this.rect, this.color, this.weight, this.filled);
    }

    isInLine(a : Point, b : Point) : boolean {
        const isAIn = isPointInRect(this.rect, a);
        const isBIn = isPointInRect(this.rect, b);

        return (
            (this.filled && (isAIn || isBIn)) ||
            (!this.filled && (isAIn || isBIn) && (isAIn !== isBIn))
        );
    }

    isInRect(rect : Rect) : boolean {
        return this.rect.intersects(rect);
    }
}
