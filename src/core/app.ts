import tweenjs from "@tweenjs/tween.js";
import { startServices, stopServices } from "../utils/system/service";
import { renderer } from "./services/renderer";

import "./services/viewport";
import "./services/toolbox";

class Application {
    constructor() {}

    start() : void {
        startServices();

        renderer.onFrameUpdate.add((dt) => tweenjs.update(dt));
    }

    stop() : void {
        stopServices();
    }
}

const app = new Application();
export default app;
