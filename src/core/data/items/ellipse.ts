import Graphics from "../../services/renderer/graphics";
import Rect from "../geometry/rect";
import { BoardItem } from "../item";

export default class Ellipse extends BoardItem {
    constructor(public rect : Rect, public color : number, public weight : number, public filled : boolean = false) {
        super();
    }

    render(graphics : Graphics) : void {
        graphics.ellipse(this.rect, this.color, this.weight, this.filled);
    }
}
