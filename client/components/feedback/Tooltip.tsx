import { Motion, Presence } from "@motionone/solid";
import { cva, VariantProps } from "class-variance-authority";
import { createEffect, createSignal, JSX, ParentComponent, Show } from "solid-js";
import { cls, pct, px } from "../../utils/dom/dom";
import { quickEaseInTransition, quickEaseOutTransition } from "../../utils/dom/motion";

import styles from "./Tooltip.module.scss";

const TooltipVariants = {
    variant: {
        default: styles.default,
        panel: styles.panel,
    },
};

const tooltipStyles = cva(styles.tooltipRoot, {
    variants: TooltipVariants,
    defaultVariants: {
        variant: "default",
    },
});

interface TooltipProps extends VariantProps<typeof tooltipStyles> {
    content : JSX.Element | string | number;
    orientation : "vertical" | "horizontal";
    offset ?: number;
    disabled ?: boolean;
    enterDelay ?: number;
    exitDelay ?: number;
}

const Tooltip : ParentComponent<TooltipProps> = (props) => {
    const [visible, setVisible] = createSignal(false);
    const [hOffset, setHOffset] = createSignal(0);
    const [hRelOffset, setHRelOffset] = createSignal(0.5);
    const defaultSide = () : string => (props.orientation === "horizontal" ? styles.right : styles.top);
    const [side, setSide] = createSignal(defaultSide());

    createEffect(() => {
        if (!visible())
            setTimeout(() => {
                setHOffset(0);
                setHRelOffset(0.5);
                setSide(props.orientation === "horizontal" ? styles.right : styles.top);
            }, 100);
    });

    const calculatePosition = (elem : HTMLElement) : void => {
        if (!visible())
            return;
        const orientation = props.orientation ?? "vertical";
        const rect = elem.getBoundingClientRect();
        const width = rect.width / 0.75;
        const height = rect.height / 0.75;
        const x = rect.x - (width - rect.width) / 2;

        if (orientation === "vertical") {
            if (x < 10) {
                setHOffset(-x + 10);
                setHRelOffset(0.5 - (-x + 10) / width);
            } else if (x + width > window.innerWidth - 10) {
                setHOffset(-(x + width - window.innerWidth) - 20);
                setHRelOffset(0.5 - (-(x + width - window.innerWidth) - 20) / width);
            }
            const y = rect.y - (height - rect.height) / 2;
            if (y < 10)
                setSide(styles.bottom);
            else
                setSide(styles.top);
        } else if (x + width > window.innerWidth) {
            setSide(styles.left);
        } else {
            setSide(styles.right);
        }
    };

    return (
        <div
            class={cls(tooltipStyles(props), side())}
            onMouseEnter={() => setVisible(true)}
            onFocus={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onBlur={() => setVisible(false)}
        >
            {props.children}
            <Presence>
                <Show when={!props.disabled && visible()}>
                    <Motion.div
                        class={styles.tooltipContainer}
                        initial={{ scale: 0.75, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { ...quickEaseInTransition, delay: props.enterDelay ?? 0.5 } }}
                        exit={{ scale: 0.75, opacity: 0, transition: { ...quickEaseOutTransition, delay: props.exitDelay ?? 0 } }}
                        style={{
                            "margin-bottom": (((props.orientation ?? "vertical") === "vertical" && side() === styles.top) ? px((props.offset ?? 0) + 7) : px(hOffset())),
                            "margin-top": (((props.orientation ?? "vertical") === "vertical" && side() === styles.bottom) ? px((props.offset ?? 0) + 7) : px(hOffset())),
                            "margin-left": ((props.orientation === "horizontal" && side() === styles.right) ? px((props.offset ?? 0) + 7) : px(hOffset())),
                            "margin-right": ((props.orientation === "horizontal" && side() === styles.left) ? px((props.offset ?? 0) + 7) : px(0)),
                            "transform-origin": (() : string => {
                                if (side() === styles.right)
                                    return "left center";
                                if (side() === styles.left)
                                    return "right center";
                                if (side() === styles.top)
                                    return `${pct(hRelOffset(), true)} bottom`;
                                return `${pct(hRelOffset(), true)} top`;
                            })(),
                        }}
                        onMotionStart={(e) => calculatePosition(e.target as HTMLElement)}
                    >
                        <div
                            class={styles.tooltipArrow}
                            style={{
                                [props.orientation === "horizontal" ? "margin-top" : "margin-left"]: px(-hOffset()),
                            }}
                        ></div>
                        <div class={styles.tooltipContent}>{props.content}</div>
                    </Motion.div>
                </Show>
            </Presence>
        </div>
    );
};

export default Tooltip;
export type { TooltipProps };
export { TooltipVariants };
