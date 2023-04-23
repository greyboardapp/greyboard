import { Component, For, Show } from "solid-js";
import { network } from "../../core/services/network";

import styles from "./ClientCursors.module.scss";
import cursorIcon from "../../assets/icons/cursor.svg";
import pencilIcon from "../../assets/icons/pencil.svg";
import touchIcon from "../../assets/icons/touch.svg";
import Icon from "../data/Icon";
import { px } from "../../utils/dom/dom";
import { PointerType } from "../../core/services/input";

const ClientCursors : Component = () => <div class={styles.cursors}>
    <For each={network.state.clients}>
        {(client) => (
            (client.id !== network.state.user?.id && <div
                classList={{
                    [styles.cursor]: true,
                    [styles.inactive]: client.afk,
                }}
                style={{
                    left: px(client.pointerX),
                    top: px(client.pointerY),
                }}
            >
                <Show when={client.pointerType === PointerType.Mouse}><Icon icon={cursorIcon} /></Show>
                <Show when={client.pointerType === PointerType.Pen}><Icon icon={pencilIcon} /></Show>
                <Show when={client.pointerType === PointerType.Touch}><Icon icon={touchIcon} /></Show>
                <span>{client.name}</span>
            </div>)
        )}
    </For>
</div>;

export default ClientCursors;
