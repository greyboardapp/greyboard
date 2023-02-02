import { onCleanup, onMount } from "solid-js";

export function createWindowListener<T extends Event>(event : keyof DocumentEventMap, callback : (e ?: T) => void) : void {
    const handler = (e : Event) : void => callback(e as T);
    onMount(() => window.addEventListener(event, handler));
    onCleanup(() => window.removeEventListener(event, handler));
}

export function createDocumentListener<T extends Event>(event : keyof DocumentEventMap, callback : (e ?: T) => void) : void {
    const handler = (e : Event) : void => callback(e as T);
    onMount(() => document.addEventListener(event, handler));
    onCleanup(() => document.removeEventListener(event, handler));
}
