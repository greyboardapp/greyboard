import { Motion, Presence } from "@motionone/solid";
import { createSignal, JSX, ParentComponent, Show } from "solid-js";
import { createDocumentListener } from "../../utils/dom/hooks";
import { quickEaseInTransition, quickEaseOutTransition } from "../../utils/dom/motion";

import styles from "./Popover.module.scss";

interface PopoverProps {
    actuator : JSX.Element;
}

const Popover : ParentComponent<PopoverProps> = (props) => {
    let root! : HTMLDivElement;

    const [open, setOpen] = createSignal(false);
    createDocumentListener("click", (e) => {
        if (!open() || root.contains(e?.target as Node))
            return;
        e?.preventDefault();
        setOpen(false);
    });

    return (
        <div
            ref={root}
            class={styles.popoverRoot}
        >
            <div
                class={styles.popoverActuator}
                onClick={() => setOpen(!open())}
            >{props.actuator}</div>
            <Presence>
                <Show when={open()}>
                    <Motion.div
                        class={styles.popoverContent}
                        initial={{ scale: 0.75, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: quickEaseInTransition }}
                        exit={{ scale: 0.75, opacity: 0, transition: quickEaseOutTransition }}
                        style={{ "transform-origin": "top left" }}
                    >
                        {props.children}
                    </Motion.div>
                </Show>
            </Presence>
        </div>
    );
};

export default Popover;
