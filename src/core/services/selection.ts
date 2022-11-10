import { Accessor, createMemo } from "solid-js";
import { track } from "../../utils/dom/solid";
import { createService, Service } from "../../utils/system/service";
import { BoardItem, BoardShapeItem } from "../data/item";
import { board } from "./board";
import { createCommand, Shortcut } from "./commands";
import { KeyModifiers } from "./input";

interface SelectionState {
    ids : number[];

    items : Accessor<BoardItem[]>;
    hasUnlockedItem : Accessor<boolean>;
    hasLabel : Accessor<boolean>;
    label : Accessor<string | null>;
    color : Accessor<number>;
    weight : Accessor<number>;
}

class Selection extends Service<SelectionState> {
    public readonly bringForward = createCommand(new Shortcut("["), () => board.bringForwardAction(this.state.items()));
    public readonly sendBackward = createCommand(new Shortcut("]"), () => board.sendBackwardAction(this.state.items()));
    public readonly delete = createCommand(new Shortcut("Delete"), () => {
        board.removeAction(this.state.items());
        this.clear();
    });

    public readonly lock = createCommand(new Shortcut("l", KeyModifiers.Control), () => {
        board.setLockStateAction({ items: this.state.items(), state: true });
        this.state.ids = track(this.state.ids.copy());
    }, () => this.state.hasUnlockedItem());

    public readonly unlock = createCommand(new Shortcut("l", KeyModifiers.Control), () => {
        board.setLockStateAction({ items: this.state.items(), state: false });
        this.state.ids = track(this.state.ids.copy());
    }, () => !this.state.hasUnlockedItem());

    public readonly toggleLabel = createCommand(new Shortcut("l", KeyModifiers.Control | KeyModifiers.Shift), () => {
        board.setLabel(this.state.items(), this.state.hasLabel() ? null : "");
        this.state.ids = track(this.state.ids.copy());
    });

    constructor() {
        super({
            ids: [],
            items: () => [],
            hasUnlockedItem: () => false,
            hasLabel: () => false,
            label: () => "",
            color: () => 0xFFFFFFFF,
            weight: () => 0,
        });

        this.state.items = createMemo(() => (this.state?.ids.flatMap((id) => board.items.get(id) ?? []) ?? null));
        this.state.hasUnlockedItem = createMemo(() => this.state.items().some((item) => !item.locked));
        this.state.hasLabel = createMemo(() => ((this.state.ids.length !== 1) ? false : this.state.items()[0]?.label !== null));
        this.state.label = createMemo(() => this.state.items()[0]?.label ?? null);
        this.state.color = createMemo(() => {
            const item = this.state.items().find((i) => i instanceof BoardShapeItem) as (BoardShapeItem | undefined);
            return item ? item.color : 0xFFFFFFFF;
        });
        this.state.weight = createMemo(() => {
            const item = this.state.items().find((i) => i instanceof BoardShapeItem) as (BoardShapeItem | undefined);
            return item ? item.weight : 0;
        });
    }

    clear() : void {
        this.state.ids = [];
    }

    copyToClipboard() : void {
        const buffer = board.serialize(this.state.items());
        window.navigator.clipboard.writeText(buffer.encode());
    }

    setLabel(label : string) : void {
        const item = this.state.items()[0];
        if (!item)
            return;
        item.label = label;
        this.state.ids = track(this.state.ids.copy());
    }

    setColor(color : number) : void {
        board.setColor(this.state.items(), color);
        this.state.ids = track(this.state.ids.copy());
    }

    setWeight(weight : number) : void {
        board.setWeight(this.state.items(), weight);
        this.state.ids = track(this.state.ids.copy());
    }
}

export const selection = createService<SelectionState, Selection>(Selection);
