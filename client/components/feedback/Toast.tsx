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
    isError ?: true;
    actions ?: ((close : () => void) => JSX.Element)[];
}

const ToastContent : Component<Toast & ToastData> = (props) => {
    const close = () : void => toast.dismiss(props.id);

    return (
        <div class={styles.content}>
            <Text content={props.title} class="px3" />
            <Show when={(props.actions && props.actions.length > 0) || props.closable}>
                <div class={styles.content}>
                    <Show when={props.actions} keyed>
                        {(actions) => <For each={actions}>
                            {(action) => action(close)}
                        </For>}
                    </Show>
                    <Show when={props.closable}>
                        <IconButton icon={CloseButton} variant="tertiary" onClick={close} />
                    </Show>
                </div>
            </Show>
        </div>
    );
};

export const showToast = (data : ToastData, duration = 5000) : string => toast((t) => ToastContent({ ...data, ...t }), { unmountDelay: 500, duration, className: cls(styles.toast, data.isError ? styles.error : "") });

export const clearToasts = () : void => toast.remove();
