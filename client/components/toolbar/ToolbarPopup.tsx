import { createSignal, JSX, ParentComponent, Show } from "solid-js";
import { Motion, Presence } from "@motionone/solid";
import { cva, VariantProps } from "class-variance-authority";
import { quickEaseOutTransition, quickEaseInTransition } from "../../utils/dom/motion";

import styles from "./ToolbarPopup.module.scss";

const ToolbarPopupVariants = {
    alignment: {
        top: styles.top,
        center: styles.center,
        bottom: styles.bottom,
    },
};

const toolbarPopupStyles = cva(styles.toolbarPopup, {
    variants: ToolbarPopupVariants,
    defaultVariants: {
        alignment: "top",
    },
});

interface ToolbarPopupProps extends VariantProps<typeof toolbarPopupStyles> {
    actuator : JSX.Element;
    active ?: boolean;
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
                        class={toolbarPopupStyles(props)}
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
