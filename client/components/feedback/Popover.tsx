import { Motion, Presence } from "@motionone/solid";
import { cva, VariantProps } from "class-variance-authority";
import { Component, createSignal, JSX, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { createDocumentListener } from "../../utils/dom/hooks";
import { quickEaseInTransition, quickEaseOutTransition } from "../../utils/dom/motion";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

import styles from "./Popover.module.scss";

const PopoverVariants = {
    ...getGenericVariants({}),
    orientation: {
        left: styles.left,
        right: styles.right,
    },
};

const popoverStyles = cva(styles.popoverRoot, {
    variants: PopoverVariants,
    defaultVariants: {
        orientation: "left",
    },
});

interface PopoverProps extends GenericProps<HTMLDivElement>, VariantProps<typeof popoverStyles> {
    actuator : JSX.Element;
    children : JSX.Element | ((close : () => void) => JSX.Element);
}

const Popover : Component<PopoverProps> = (props) => {
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
            {...getGenericProps(props)}
            ref={root}
            class={cls(popoverStyles(props), props.class)}
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
                        style={{ "transform-origin": `top ${props.orientation}` }}
                    >
                        {typeof props.children === "function" ? props.children(() => setOpen(false)) : props.children}
                    </Motion.div>
                </Show>
            </Presence>
        </div>
    );
};

export default Popover;
