import { onCleanup, onMount } from "solid-js";

export function createWindowListener<T extends Event>(event : string, callback : (e : T) => void, options ?: AddEventListenerOptions) : void {
    const handler = (e : Event) : void => callback(e as T);
    onMount(() => window.addEventListener(event, handler, options));
    onCleanup(() => window.removeEventListener(event, handler));
}

export function createDocumentListener<T extends Event>(event : keyof DocumentEventMap, callback : (e ?: T) => void, options ?: AddEventListenerOptions) : void {
    const handler = (e : Event) : void => callback(e as T);
    onMount(() => document.addEventListener(event, handler, options));
    onCleanup(() => document.removeEventListener(event, handler));
}
