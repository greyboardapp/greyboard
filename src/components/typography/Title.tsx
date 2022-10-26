import { Component, Match, Switch } from "solid-js";
import { LanguageTexts } from "../../languages/languages";
import { getText } from "../../utils/system/intl";

import styles from "./Typography.module.scss";

interface TitleProps {
    key : keyof LanguageTexts;
    size ?: "s" | "m" | "l" | "xl";
    uppercase ?: boolean;
    faded ?: boolean;
    bold ?: boolean;
    class ?: string;
}

const Title : Component<TitleProps> = (props) => {
    const getClassList = () : {[key : string] : boolean | undefined} => ({
        [props.class ?? ""]: true,
        [styles.uppercase]: props.uppercase,
        [styles.faded]: props.faded,
        [styles.bold]: props.bold,
    });

    return (
        <Switch fallback={<h1 classList={getClassList()}>{getText(props.key)}</h1>}>
            <Match when={props.size === "s"}>
                <h4 classList={getClassList()}>{getText(props.key)}</h4>
            </Match>
            <Match when={props.size === "m"}>
                <h3 classList={getClassList()}>{getText(props.key)}</h3>
            </Match>
            <Match when={props.size === "l"}>
                <h2 classList={getClassList()}>{getText(props.key)}</h2>
            </Match>
        </Switch>
    );
};

export default Title;
