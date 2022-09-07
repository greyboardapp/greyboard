import { startServices, stopServices } from "../utils/system/service";

import "./services/viewport";
import "./services/toolbox";

import Rect from "./data/geometry/rect";
import Rectangle from "./data/items/rectangle";
import { board } from "./services/board";

class Application {
    constructor() {}

    start() : void {
        startServices();
    }

    stop() : void {
        stopServices();
    }
}

const app = new Application();
export default app;
