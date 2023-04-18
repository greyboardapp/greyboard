import { Tool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import { viewport } from "../viewport";
import { Shortcut } from "../commands";

import handIcon from "../../../assets/icons/hand.svg";

export class ViewTool extends Tool {
    private prevTool ?: Tool;

    constructor() {
        super({
            name: "tools.view",
            icon: handIcon,
            shortcut: new Shortcut("V"),
        });
    }

    onSelected(previous ?: Tool) : void {
        this.prevTool = previous;
    }

    onActionStart(data : PointerEventData) : boolean {
        if (data.button !== MouseButton.Primary)
            return false;

        return true;
    }

    onActionMove(data : PointerEventData) : void {
        const movement = data.movement.first();
        if (movement)
            viewport.pan(movement);
    }

    onActionEnd(data : PointerEventData) : void {
        const movement = data.movement.first();
        if (movement && (Math.abs(movement.x) > 2 || Math.abs(movement.y) > 2))
            viewport.panRollOff(movement);

        if (this.prevTool && data.button === MouseButton.Auxiliary)
            toolbox.state.selectedTool = this.prevTool;
        this.prevTool = undefined;
    }
}
