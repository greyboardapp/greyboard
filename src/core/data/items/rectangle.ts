import Graphics from "../../graphics";
import Rect from "../geometry/rect";
import { BoardItem } from "../item";

export default class Rectangle extends BoardItem {
    constructor(public rect : Rect, public color : number, public weight : number, public filled : boolean = false) {
        super();
    }

    render(graphics : Graphics) : void {
        graphics.rect(this.rect, this.color);
    }
}
