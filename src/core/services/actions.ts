import { createStatelessService, Service } from "../../utils/system/service";

interface Action<T> {
    (data : T) : void;
    invoke : (data : T) => void;
    forward : (data : T) => void;
    backward : (data : T) => void;
}

interface ActionEntry {
    data : unknown;
    forward : (data : unknown) => void;
    backward : (data : unknown) => void;
}

class ActionStack extends Service {
    public static readonly STACK_LIMIT = 100;
    private readonly undoStack : ActionEntry[] = [];
    private readonly redoStack : ActionEntry[] = [];

    constructor() {
        super({});
    }

    start() : void {
        this.undoStack.clear();
        this.redoStack.clear();
    }

    push<T>(action : Action<T>, data : T) : void {
        if (this.undoStack.length > ActionStack.STACK_LIMIT)
            this.undoStack.shift();

        this.undoStack.push({
            data,
            forward: action.forward as (data : unknown) => void,
            backward: action.backward as (data : unknown) => void,
        });

        action.forward(data);

        this.redoStack.clear();
    }

    undo() : void {
        const entry = this.undoStack.pop();
        if (!entry)
            return;
        entry.backward(entry.data);
        this.redoStack.push(entry);
    }

    redo() : void {
        const entry = this.redoStack.pop();
        if (!entry)
            return;
        entry.forward(entry.data);
        this.undoStack.push(entry);
    }
}

export const actions = createStatelessService(ActionStack);

export function createAction<T>(forward : (data : T) => void, backward : (data : T) => void) : Action<T> {
    const instance = ((data : T) => { instance.invoke(data); }) as Action<T>;
    instance.invoke = (data : T) => actions.push(instance, data);
    instance.forward = forward;
    instance.backward = backward;
    return instance;
}
