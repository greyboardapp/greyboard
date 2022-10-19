import tweenjs from "@tweenjs/tween.js";
import { startServices, stopServices } from "../utils/system/service";
import { renderer } from "./services/renderer";

import "./services/viewport";
import "./services/toolbox";
import { input, KeyModifiers, Shortcut } from "./services/input";
import { actions } from "./services/actions";

class Application {
    constructor() {}

    start() : void {
        startServices();

        renderer.onFrameUpdate.add((dt) => tweenjs.update(dt));

        input.registerShortcut(new Shortcut("z", KeyModifiers.Control), () => actions.undo());
        input.registerShortcut(new Shortcut("z", KeyModifiers.Control | KeyModifiers.Shift), () => actions.redo());
    }

    stop() : void {
        stopServices();
    }
}

const app = new Application();
export default app;
