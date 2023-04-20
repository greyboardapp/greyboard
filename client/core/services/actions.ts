import { createService, Service } from "../../utils/system/service";

interface Action<T> {
    (data : T, execute ?: boolean) : void;
    invoke : (data : T, execute ?: boolean) => void;
    forward : (data : T, execute ?: boolean) => void;
    backward : (data : T, execute ?: boolean) => void;
}

interface ActionEntry {
    data : unknown;
    forward : (data : unknown, execute ?: boolean) => void;
    backward : (data : unknown, execute ?: boolean) => void;
}

interface ActionStackState {
    undoStack : ActionEntry[];
    redoStack : ActionEntry[];
}

class ActionStack extends Service<ActionStackState> {
    public static readonly STACK_LIMIT = 100;

    constructor() {
        super({
            undoStack: [],
            redoStack: [],
        });
    }

    start() : void {
        this.state.undoStack.clear();
        this.state.redoStack.clear();
    }

    push<T>(action : Action<T>, data : T, execute = true) : void {
        if (this.state.undoStack.length > ActionStack.STACK_LIMIT)
            this.state.undoStack.shift();

        this.state.undoStack.push({
            data,
            forward: action.forward as (data : unknown) => void,
            backward: action.backward as (data : unknown) => void,
        });

        action.forward(data, execute);

        this.state.redoStack.clear();
    }

    undo() : void {
        const entry = this.state.undoStack.pop();
        if (!entry)
            return;
        entry.backward(entry.data, true);
        this.state.redoStack.push(entry);
    }

    canUndo() : boolean {
        return this.state.undoStack.length > 0;
    }

    redo() : void {
        const entry = this.state.redoStack.pop();
        if (!entry)
            return;
        entry.forward(entry.data, true);
        this.state.undoStack.push(entry);
    }

    canRedo() : boolean {
        return this.state.redoStack.length > 0;
    }
}

export const actions = createService<ActionStackState, ActionStack>(ActionStack);

export function createAction<T>(forward : (data : T) => void, backward : (data : T) => void) : Action<T> {
    const instance = ((data : T, execute = true) => { instance.invoke(data, execute); }) as Action<T>;
    instance.invoke = (data : T, execute = true) => actions.push(instance, data, execute);
    instance.forward = forward;
    instance.backward = backward;
    return instance;
}
