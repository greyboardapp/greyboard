import { startServices, stopServices } from "../utils/system/service";

import "./services/renderer";
import "./services/viewport";
import "./services/toolbox";
import { KeyModifiers } from "./services/input";
import { actions } from "./services/actions";
import { createCommand, Shortcut } from "./services/commands";

class Application {
    public undo = createCommand(new Shortcut("z", KeyModifiers.Control), () => actions.undo(), () => actions.canUndo());
    public redo = createCommand(new Shortcut("z", KeyModifiers.Control | KeyModifiers.Shift), () => actions.redo(), () => actions.canRedo());

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
