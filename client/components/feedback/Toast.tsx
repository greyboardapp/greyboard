import { Component, For, JSX, Show } from "solid-js";

import toast, { Toast } from "solid-toast";
import styles from "./Toast.module.scss";
import Text from "../typography/Text";
import IconButton from "../controls/IconButton";

import CloseButton from "../../assets/icons/close.svg";
import { cls } from "../../utils/dom/dom";

interface ToastData {
    title : string;
    closable ?: true;
    actions ?: ((close : () => void) => JSX.Element)[];
}

const ToastContent : Component<Toast & ToastData> = (props) => {
    const close = () : void => toast.dismiss(props.id);

    return (
        <div class={styles.content}>
            <Text content={props.title} />
            <div class={cls(styles.content, "pl3")}>
                <Show when={props.actions} keyed>
                    {(actions) => <For each={actions}>
                        {(action) => action(close)}
                    </For>}
                </Show>
                <Show when={props.closable}>
                    <IconButton icon={CloseButton} variant="tertiary" onClick={close} />
                </Show>
            </div>
        </div>
    );
};

export const showToast = (data : ToastData, duration = 5000) : string => toast((t) => ToastContent({ ...data, ...t }), { unmountDelay: 500, duration, className: styles.toast });

export const clearToasts = () : void => toast.remove();
