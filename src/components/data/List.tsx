import { cva, VariantProps } from "class-variance-authority";
import { For, JSX, ParentComponent } from "solid-js";

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
    each : T[];
    fallback ?: JSX.Element;
    children : (item : T) => JSX.Element;
}

function List<T>(props : ListProps<T>) : JSX.Element {
    return <div class={listStyles(props)}>
        <For each={props.each} fallback={props.fallback}>
            {props.children}
        </For>
    </div>;
}

const ListItem : ParentComponent = (props) => (
    <div class={styles.listItem}>{props.children}</div>
);

export { List, ListItem };
