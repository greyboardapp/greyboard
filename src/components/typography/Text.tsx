import { Component } from "solid-js";
import { LanguageTexts } from "../../languages/languages";
import { getText } from "../../utils/intl";

import styles from "./Typography.module.scss";

interface TextProps {
    key : keyof LanguageTexts;
    size ?: "s" | "m" | "l" | "xl";
    uppercase ?: boolean;
    faded ?: boolean;
    bold ?: boolean;
    class ?: string;
}

const Text : Component<TextProps> = (props) => (
    <p classList={{
        [props.class ?? ""]: true,
        [styles[props.size ?? "m"]]: true,
        [styles.uppercase]: props.uppercase,
        [styles.faded]: props.faded,
        [styles.bold]: props.bold,
    }}>{getText(props.key)}</p>
);

export default Text;
