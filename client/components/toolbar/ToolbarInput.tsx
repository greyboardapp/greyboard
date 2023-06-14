import { Component, createSignal, Show } from "solid-js";
import { getText } from "../../utils/system/intl";
import Text from "../typography/Text";

import styles from "./ToolbarInput.module.scss";
import { cls } from "../../utils/dom/dom";

interface ToolbarInputProps {
    model : [() => string, (v : string) => void];
    placeholder ?: string;
    onChange ?: (e : Event, newValue : string, oldValue : string) => undefined | boolean | Promise<undefined | boolean>;
    class ?: string;
    disabled ?: boolean;
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
            class={cls(styles.toolbarInput, props.class)}
            onClick={() => {
                if (props.disabled)
                    return;
                setFocused(true);
                if (input)
                    input.focus();
            }}
        >
            <Show when={focused()} fallback={<Text content={previewValue()} />}>
                <input
                    ref={input}
                    type="text"
                    value={props.model[0]()}
                    placeholder={getText(props.placeholder)}
                    disabled={props.disabled}
                    onInput={(e) => { props.model[1]((e.target as HTMLInputElement).value); }}
                    onKeyUp={(e) => {
                        if (e.key === "Enter")
                            (e.target as HTMLInputElement).blur();
                    }}
                    onChange={async (e) => {
                        if (props.onChange) {
                            const isValid = props.onChange(e, (e.target as HTMLInputElement).value, originalValue());
                            if (isValid === false || (isValid instanceof Promise && (await isValid) === false)) {
                                if (input)
                                    input.value = originalValue();
                                props.model[1](originalValue());
                            }
                        }
                    }}
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
