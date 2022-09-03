import { onCleanup, onMount } from "solid-js";
import { Container } from "./system/di";
import { EventDispatcher } from "./system/events";

export function createWindowListener<T extends Event>(event : keyof DocumentEventMap, callback : (e ?: T) => void) : void {
    onMount(() => window.addEventListener(event, callback));
    onCleanup(() => window.removeEventListener(event, callback));
}

export function useEventDispatcher() : EventDispatcher {
    return Container.get<EventDispatcher>(EventDispatcher);
}
