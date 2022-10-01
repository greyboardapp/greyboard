import { Accessor, Signal, createRenderEffect } from "solid-js";

export function model(element : HTMLInputElement, value : Accessor<Signal<string>>) : void {
    const [field, setField] = value();
    createRenderEffect(() => { element.value = field(); });
    element.addEventListener("input", (e) => setField((e.target as HTMLInputElement).value));
}
