import { cva, VariantProps } from "class-variance-authority";
import { For, JSX, ParentComponent, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";

import styles from "./List.module.scss";

const ListVariants = {
    flush: {
        true: styles.flush,
    },
};

const listStyles = cva(styles.list, {
    variants: ListVariants,
    defaultVariants: {
        flush: false,
    },
});

interface ListProps<T> extends VariantProps<typeof listStyles> {
    each ?: T[];
    fallback ?: JSX.Element;
    children : ((item : T) => JSX.Element) | JSX.Element;
    class ?: string;
}

function List<T>(props : ListProps<T>) : JSX.Element {
    return (
        <div class={cls(props.class, listStyles(props))}>
            <Show when={props.each} fallback={props.children as JSX.Element}>
                <For each={props.each} fallback={props.fallback}>
                    {props.children as (item : T) => JSX.Element}
                </For>
            </Show>
        </div>
    );
}

const ListItem : ParentComponent = (props) => (
    <div class={styles.listItem}>{props.children}</div>
);

export { List, ListItem };
