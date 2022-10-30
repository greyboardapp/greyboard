import { Component, For } from "solid-js";
import { Story, Meta } from "@storybook/html";

interface VariantOption {
    [key : string] : string | string[];
}

interface VariantOptions {
    [key : string] : VariantOption;
}

export function makeComponentMetaFromVariants(variants : VariantOptions, path : string) : Meta {
    const argTypes : Record<string, object> = {};

    for (const [key, value] of Object.entries(variants)) {
        const options = Object.keys(value);
        if (options.includes("true") || options.includes("false"))
            argTypes[key] = { control: "boolean" };
        else
            argTypes[key] = { control: "select", options };
    }

    return {
        title: path,
        argTypes,
    };
}

export function makeStoryVariant<T>(Comp : Component<T>, args : Partial<T>) : Story<T> {
    const variant : Story<T> = ((props : T) => <Comp {...props}/>);
    variant.args = args;
    return variant;
}

export function makeStoryVariants<T>(Comp : Component<T>, variants : VariantOptions, defaultArgs : Partial<T>) : Story<T> {
    let args : Record<string, unknown>[] = [{}];

    for (const [key, values] of Object.entries(variants)) {
        const len = args.length;
        for (let i = 0; i < len; i++) {
            const options = Object.keys(values);
            if (options.includes("true") || options.includes("false")) {
                args.push({ ...args[i], [key]: true });
                args.push({ ...args[i], [key]: false });
            } else {
                for (const value of options)
                    args.push({
                        ...args[i],
                        [key]: value,
                    });
            }
        }
    }

    args = args.filter((arg) => Object.keys(arg).length === Object.keys(variants).length).map((arg) => ({ ...defaultArgs, ...arg }));

    return ((props : T) => (
        <For each={args}>
            {(arg) => (
                <div style={{ "margin-bottom": "2rem" }}>
                    <p>{Object.entries(arg).filter(([key]) => key in variants).map(([key, value]) => `${key}: ${value}`).join("; ")}</p>
                    <Comp {...arg} />
                </div>
            )}
        </For>
    )) as Story<T>;
}
