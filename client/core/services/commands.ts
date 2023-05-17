import { createStatelessService, Service } from "../../utils/system/service";
import { KeyboardEventData, KeyModifiers } from "./input";

interface Command {
    () : void;
    shortcut : Shortcut;
    when : () => boolean;
    invoke() : void;
}

class Shortcut {
    constructor(
        public key : string,
        public modifiers : KeyModifiers = KeyModifiers.None,
    ) {}

    toString() : string {
        const str : string[] = [];
        if (this.modifiers & KeyModifiers.Control)
            str.push("CTRL");
        if (this.modifiers & KeyModifiers.Shift)
            str.push("SHIFT");
        if (this.modifiers & KeyModifiers.Alt)
            str.push("ALT");
        str.push(this.key.toUpperCase());
        return str.join(" + ");
    }
}

class CommandService extends Service {
    private readonly commands : Command[] = [];

    constructor() {
        super({});
    }

    push(command : Command) : void {
        if (!this.commands.find((c) => c.shortcut.key === command.shortcut.key && c.shortcut.modifiers === command.shortcut.modifiers))
            this.commands.push(command);
    }

    triggerCommand(data : KeyboardEventData) : boolean {
        for (const command of this.commands)
            if (command.shortcut.key.toUpperCase() === data.button.toUpperCase() && command.shortcut.modifiers === data.modifiers)
                if (command.when()) {
                    command.invoke();
                    return true;
                }

        return false;
    }
}

export const commands = createStatelessService(CommandService);

export function createCommand(shortcut : Shortcut, action : () => void, when ?: () => boolean) : Command {
    const instance = (() => { instance.invoke(); }) as Command;
    instance.shortcut = shortcut;
    instance.invoke = action;
    instance.when = when ?? (() => true);
    commands.push(instance);
    return instance;
}

export { Shortcut };
