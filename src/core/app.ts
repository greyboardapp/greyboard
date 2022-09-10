import tweenjs from "@tweenjs/tween.js";
import { startServices, stopServices } from "../utils/system/service";
import { dynamicRenderer } from "./services/renderer";

import "../utils/system/array";

import "./services/viewport";
import "./services/toolbox";

class Application {
    constructor() {}

    start() : void {
        startServices();

        dynamicRenderer.onRender.add((graphics, dt) => tweenjs.update(dt));
    }

    stop() : void {
        stopServices();
    }
}

const app = new Application();
export default app;
