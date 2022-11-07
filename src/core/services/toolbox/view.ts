import tweenjs, { Tween } from "@tweenjs/tween.js";
import { Tool } from "./tool";
import { MouseButton, PointerEventData } from "../input";
import { toolbox } from "../toolbox";
import { viewport, ViewportState } from "../viewport";
import { Shortcut } from "../commands";

import handIcon from "../../../assets/icons/hand.svg";

export class ViewTool extends Tool {
    private prevTool ?: Tool;
    private inertiaTween : Tween<ViewportState> | null = null;

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

        if (this.inertiaTween)
            tweenjs.remove(this.inertiaTween);

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
            this.inertiaTween = new tweenjs.Tween(viewport.state)
                .to({ offsetX: viewport.state.offsetX + movement.x * 5, offsetY: viewport.state.offsetY + movement.y * 5 }, 500)
                .easing(tweenjs.Easing.Cubic.Out)
                .start()
                .onComplete(() => { this.inertiaTween = null; });

        if (this.prevTool && data.button === MouseButton.Auxiliary)
            toolbox.state.selectedTool = this.prevTool;
        this.prevTool = undefined;
    }
}
