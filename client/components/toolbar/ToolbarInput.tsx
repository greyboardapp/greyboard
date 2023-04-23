import { Component, createSignal, Show } from "solid-js";
import { getText } from "../../utils/system/intl";
import Text from "../typography/Text";

import styles from "./ToolbarInput.module.scss";

interface ToolbarInputProps {
    model : [() => string, (v : string) => void];
    placeholder ?: string;
    onChange ?: (e : Event, newValue : string, oldValue : string) => void;
}

const ToolbarInput : Component<ToolbarInputProps> = (props) => {
    const [focused, setFocused] = createSignal(false);
    const [originalValue, setOriginalValue] = createSignal("");
    let input : HTMLInputElement | undefined;

    const previewValue = () : string => {
        const v = props.model[0]();
        return (v.trim() === "" ? props.placeholder : v) ?? v;
    };

    return (
        <div
            class={styles.toolbarInput}
            onClick={() => {
                setFocused(true);
                if (input)
                    input.focus();
            }}
        >
            <Show when={focused()} fallback={<Text content={previewValue()} />}>
                <input
                    ref={input}
                    value={props.model[0]()}
                    placeholder={getText(props.placeholder)}
                    onInput={(e) => { props.model[1]((e.target as HTMLInputElement).value); }}
                    onKeyUp={(e) => {
                        if (e.key === "Enter")
                            (e.target as HTMLInputElement).blur();
                    }}
                    onChange={(e) => props.onChange && props.onChange(e, (e.target as HTMLInputElement).value, originalValue())}
                    onFocus={(e) => setOriginalValue((e.target as HTMLInputElement).value)}
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
