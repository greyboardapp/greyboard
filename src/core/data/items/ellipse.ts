import { isPointInEllipse } from "../../../utils/system/intersections";
import Graphics from "../../services/renderer/graphics";
import Point from "../geometry/point";
import Rect from "../geometry/rect";
import { BoardItem } from "../item";

export default class Ellipse extends BoardItem {
    constructor(public rect : Rect, public color : number, public weight : number, public filled : boolean = false) {
        super();
    }

    render(graphics : Graphics) : void {
        graphics.ellipse(this.rect, this.color, this.weight, this.filled);
    }

    isInLine(a : Point, b : Point) : boolean {
        const isAIn = isPointInEllipse(this.rect, a);
        const isBIn = isPointInEllipse(this.rect, b);

        return (
            (this.filled && (isAIn || isBIn)) ||
            (!this.filled && (isAIn || isBIn) && (isAIn !== isBIn))
        );
    }
}
