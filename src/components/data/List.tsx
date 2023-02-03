import { cva, VariantProps } from "class-variance-authority";
import { For, JSX, ParentComponent, Show } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";

import styles from "./List.module.scss";

const ListVariants = {
    ...getGenericVariants({}),
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

interface ListProps<T> extends GenericProps<HTMLDivElement>, VariantProps<typeof listStyles> {
    each ?: T[];
    fallback ?: JSX.Element;
    children : ((item : T) => JSX.Element) | JSX.Element;
    class ?: string;
}

function List<T>(props : ListProps<T>) : JSX.Element {
    return (
        <div {...getGenericProps(props)} class={cls(listStyles(props), props.class)}>
            <Show when={props.each} fallback={props.children as JSX.Element}>
                <For each={props.each} fallback={props.fallback}>
                    {props.children as (item : T) => JSX.Element}
                </For>
            </Show>
        </div>
    );
}

interface ListItemProps extends GenericProps<HTMLDivElement> {
    onClick ?: (e : MouseEvent) => void;
}

const ListItem : ParentComponent<ListItemProps> = (props) => (
    <div
        {...getGenericProps(props)}
        class={cls(styles.listItem, props.class)}
        onClick={(e) => (props.onClick && props.onClick(e))}
    >{props.children}</div>
);

export { List, ListItem };
