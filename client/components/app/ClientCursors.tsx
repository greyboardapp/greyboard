import { Component, For } from "solid-js";
import { network } from "../../core/services/network";

import styles from "./ClientCursors.module.scss";
import cursorIcon from "../../assets/icons/cursor.svg";
import Icon from "../data/Icon";
import { px } from "../../utils/dom/dom";

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
                <Icon icon={cursorIcon} />
                <span>{client.name}</span>
            </div>)
        )}
    </For>
</div>;

export default ClientCursors;
