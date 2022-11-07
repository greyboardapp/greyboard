import { cva, VariantProps } from "class-variance-authority";
import { Component, JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { LanguageTexts } from "../../languages/languages";
import { cls } from "../../utils/dom/dom";
import { getText } from "../../utils/system/intl";
import { throwError } from "../../utils/system/misc";

import styles from "./Typography.module.scss";

const TextVariants = {
    size: {
        xs: styles.xs,
        s: styles.s,
        m: styles.m,
        l: styles.l,
        xl: styles.xl,
    },
    uppercase: {
        true: styles.uppercase,
    },
    faded: {
        true: styles.faded,
    },
    bold: {
        true: styles.bold,
    },
};

const textStyles = cva("", {
    variants: TextVariants,
    defaultVariants: {
        size: "m",
        uppercase: false,
        faded: false,
        bold: false,
    },
});

interface TextProps extends VariantProps<typeof textStyles> {
    content : keyof LanguageTexts | string;
    as ?: keyof JSX.IntrinsicElements;
    class ?: string;
}

const Text : Component<TextProps> = (props) => (
    <Dynamic
        component={props.as ?? "p"}
        class={cls(textStyles(props), props.class)}
    >
        {getText(props.content)}
    </Dynamic>
);

export default Text;
export { TextVariants };
