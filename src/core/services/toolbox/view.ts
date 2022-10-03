import tweenjs, { Tween } from "@tweenjs/tween.js";
import Rect from "../../data/geometry/rect";
import Rectangle from "../../data/items/rectangle";
import { Tool } from "./tool";
import { MouseButton, PointerEventData, Shortcut } from "../input";
import { toolbox } from "../toolbox";
import { viewport, ViewportState } from "../viewport";

import handIcon from "../../../assets/icons/hand.svg";

export class ViewTool extends Tool {
    private prevTool ?: Tool;
    private inertiaTween : Tween<ViewportState> | null = null;

    constructor() {
        super({
            name: "View",
            icon: handIcon,
            shortcut: new Shortcut("V"),
        });
    }

    new() : Rectangle {
        return new Rectangle(new Rect(), toolbox.state.selectedColor, toolbox.state.selectedWeight, true);
    }

    onSelected(previous ?: Tool) : void {
        this.prevTool = previous;
    }

    onActionStart(data : PointerEventData) : void {
        if (this.inertiaTween)
            tweenjs.remove(this.inertiaTween);
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
    }
}
