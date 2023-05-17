import { cva, VariantProps } from "class-variance-authority";
import { For, ParentComponent, Show } from "solid-js";
import { cls, px } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import { omitProperty } from "../../utils/system/misc";

import styles from "./Skeleton.module.scss";

const SkeletonVariants = {
    ...getGenericVariants({}),
    circle: {
        true: styles.circle,
    },
    text: {
        true: styles.text,
    },
};

const skeletonStyles = cva(styles.skeleton, {
    variants: SkeletonVariants,
    defaultVariants: {
        circle: false,
        text: false,
    },
});

interface SkeletonProps extends GenericProps<HTMLDivElement>, VariantProps<typeof skeletonStyles> {
    loaded ?: true;
    width ?: number;
    height ?: number;
    lineCount ?: number;
}

const Skeleton : ParentComponent<SkeletonProps> = (props) => (
    <Show when={props.loaded} fallback={
        props.lineCount ? (
            <div class={cls(styles.skeletonList, props.class)}>
                <For each={new Array(props.lineCount ?? 1)}>
                    {() => <div class={skeletonStyles(omitProperty({ ...props }, "class"))}></div>}
                </For>
            </div>
        ) : (
            <div
                {...getGenericProps(props)}
                class={cls(skeletonStyles(props), props.class)}
                style={{
                    width: props.width ? px(props.width) : undefined,
                    height: props.height ? px(props.height) : undefined,
                }}
            ></div>
        )
    }>
        {props.children}
    </Show>
);

export default Skeleton;
