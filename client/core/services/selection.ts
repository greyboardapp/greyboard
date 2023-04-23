import { Accessor, createMemo } from "solid-js";
import { track } from "../../utils/dom/solid";
import { createService, Service } from "../../utils/system/service";
import Rect from "../data/geometry/rect";
import { BoardItem, BoardShapeItem } from "../data/item";
import { board } from "./board";
import { createCommand, Shortcut } from "./commands";
import { KeyModifiers } from "./input";
import { viewport } from "./viewport";

interface SelectionState {
    ids : number[];

    items : Accessor<BoardItem[]>;
    rect : Accessor<Rect | null>;
    screenRect : Accessor<Rect | null>;
    hasUnlockedItem : Accessor<boolean>;
    hasAllItemsLocked : Accessor<boolean>;
    hasLabel : Accessor<boolean>;
    label : Accessor<string | null>;
    color : Accessor<number>;
    weight : Accessor<number>;
}

class Selection extends Service<SelectionState> {
    public readonly bringForward = createCommand(new Shortcut("["), () => {
        this.removeLockedItems();
        board.bringForwardAction(this.state.items());
    });

    public readonly sendBackward = createCommand(new Shortcut("]"), () => {
        this.removeLockedItems();
        board.sendBackwardAction(this.state.items());
    });

    public readonly delete = createCommand(new Shortcut("Delete"), () => {
        this.removeLockedItems();
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
        board.setLabelAction({ items: this.state.items(), newLabel: this.state.hasLabel() ? null : "", oldLabel: this.state.label() });
        this.state.ids = track(this.state.ids.copy());
    });

    constructor() {
        super({
            ids: [],
            items: () => [],
            rect: () => new Rect(),
            screenRect: () => new Rect(),
            hasUnlockedItem: () => false,
            hasAllItemsLocked: () => false,
            hasLabel: () => false,
            label: () => "",
            color: () => 0xFFFFFFFF,
            weight: () => 0,
        });

        this.state.items = createMemo(() => (this.state?.ids.flatMap((id) => board.items.get(id) ?? []) ?? null));
        this.state.rect = createMemo(() => {
            if (this.state.ids.length === 0)
                return null;

            return board.getItemsBoundingBox(this.state.items());
        });
        this.state.screenRect = createMemo(() => {
            const rect = this.state.rect();
            if (!rect)
                return null;
            const screenRect = viewport.viewportToBoardRect(rect);
            return new Rect(screenRect.x + viewport.state.offsetX, screenRect.y + viewport.state.offsetY, screenRect.w, screenRect.h);
        });
        this.state.hasUnlockedItem = createMemo(() => this.state.items().some((item) => !item.locked));
        this.state.hasAllItemsLocked = createMemo(() => this.state.items().every((item) => item.locked));
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

    refresh() : void {
        this.state.ids = track(this.state.ids.copy());
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
        this.refresh();
    }

    setColor(color : number) : void {
        this.removeLockedItems();
        board.setColorAction({ items: this.state.items(), newColor: color, oldColor: this.state.color() });
        this.refresh();
    }

    setWeight(weight : number) : void {
        this.removeLockedItems();
        board.setWeight(this.state.items(), weight);
        this.refresh();
    }

    removeLockedItems() : void {
        this.state.ids = this.state.items().filter((item) => !item.locked).map((item) => item.id);
    }
}

export const selection = createService<SelectionState, Selection>(Selection);
