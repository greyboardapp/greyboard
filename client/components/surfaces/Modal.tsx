import { Motion, Presence } from "@motionone/solid";
import { cva, VariantProps } from "class-variance-authority";
import { Accessor, createSignal, For, JSX, ParentComponent, Show } from "solid-js";
import { getGenericVariants } from "../../utils/dom/props";
import Title from "../typography/Title";

import styles from "./Modal.module.scss";

const ModalVariants = {
    ...getGenericVariants({}),
    size: {
        s: styles.s,
        m: styles.m,
    },
};

const modalStyles = cva(styles.panel, {
    variants: ModalVariants,
    defaultVariants: {
        size: "s",
    },
});

interface ModalOptions extends VariantProps<typeof modalStyles> {
    title ?: string;
    content : JSX.Element;
    buttons ?: ((close : () => void) => JSX.Element)[];
}

const [modals, setModals] = createSignal<ModalOptions[]>([]);

const showModal = (options : ModalOptions) : void => { setModals([...modals(), options]); };

const closeModal = (i : Accessor<number>) : void => {
    modals().splice(i(), 1);
    setModals(modals().filter((m, mi) => mi === i()));
};

const ModalProvider : ParentComponent = (props) => (
    <>
        <Show when={modals().length > 0}>
            <Motion.div class={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <For each={modals()}>
                    {(modal, i) => (
                        <Presence>
                            <div class={styles.modal}>
                                <Motion.div
                                    class={modalStyles(modal)}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                >
                                        <Show when={modal.title} keyed>
                                            {(title) => <Title class={styles.title} content={title} size="s" />}
                                        </Show>
                                        <div class={styles.content}>{modal.content}</div>
                                        <div class={styles.buttons}>
                                            <For each={modal.buttons}>
                                                {(button, i) => button(() => closeModal(i))}
                                            </For>
                                        </div>
                                </Motion.div>
                            </div>
                        </Presence>
                    )}
                </For>
            </Motion.div>
        </Show>
        {props.children}
    </>
);
export default ModalProvider;

export { showModal };
