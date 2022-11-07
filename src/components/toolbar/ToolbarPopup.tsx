import { createSignal, JSX, ParentComponent, Show } from "solid-js";
import { Motion, Presence } from "@motionone/solid";

import styles from "./ToolbarPopup.module.scss";
import { quickEaseOutTransition, quickEaseInTransition } from "../../utils/dom/motion";

interface ToolbarPopupProps {
    actuator : JSX.Element;
    active ?: boolean;
    origin ?: "corner" | "center";
}

const ToolbarPopup : ParentComponent<ToolbarPopupProps> = (props) => {
    let timer : number | null = null;
    const [open, setOpen] = createSignal(false);

    return (
        <div
            class={styles.toolbarPopupActuator}
            onMouseEnter={() => {
                if (timer)
                    clearTimeout(timer);
                setOpen(true);
            }}
            onMouseLeave={() => {
                if (timer)
                    clearTimeout(timer);
                timer = setTimeout(() => setOpen(false), 300, null);
            }}
        >
            {props.actuator}
            <Presence>
                <Show when={(props.active ?? true) && open()}>
                    <Motion.div
                        class={styles.toolbarPopup}
                        style={{
                            "transform-origin": props.origin === "center" ? "left center" : "left top",
                        }}
                        initial={{ scale: 0.75, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: quickEaseInTransition }}
                        exit={{ scale: 0.75, opacity: 0, transition: quickEaseOutTransition }}
                    >
                        {props.children}
                    </Motion.div>
                </Show>
            </Presence>
        </div>
    );
};

export default ToolbarPopup;
