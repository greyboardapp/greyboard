import { Component, createSignal, Show } from "solid-js";
import Text from "../typography/Text";

import styles from "./ToolbarInput.module.scss";

interface ToolbarInputProps {
    model : [() => string, (v : string) => void];
    onChange ?: (e : Event) => void;
}

const ToolbarInput : Component<ToolbarInputProps> = (props) => {
    const [focused, setFocused] = createSignal(false);
    let input : HTMLInputElement | undefined;

    return (
        <div
            class={styles.toolbarInput}
            onClick={() => {
                setFocused(true);
                if (input)
                    input.focus();
            }}
        >
            <Show when={focused()} fallback={<Text content={props.model[0]()} />}>
                <input
                    ref={input}
                    value={props.model[0]()}
                    onInput={(e) => { props.model[1]((e.target as HTMLInputElement).value); }}
                    onKeyUp={(e) => {
                        if (e.key === "Enter")
                            (e.target as HTMLInputElement).blur();
                    }}
                    onChange={(e) => props.onChange && props.onChange(e)}
                    onBlur={(e) => {
                        props.model[1]((e.target as HTMLInputElement).value);
                        setFocused(false);
                    }}
                />
            </Show>
        </div>
    );
};

export default ToolbarInput;
