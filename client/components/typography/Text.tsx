import { cva, VariantProps } from "class-variance-authority";
import { Component, JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { LanguageTexts } from "../../languages/languages";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import { getText } from "../../utils/system/intl";

import styles from "./Typography.module.scss";

const TextVariants = {
    ...getGenericVariants({}),
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
    italic: {
        true: styles.italic,
    },
    centered: {
        true: styles.centered,
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

interface TextProps extends GenericProps<HTMLParagraphElement>, VariantProps<typeof textStyles> {
    content : keyof LanguageTexts | string;
    as ?: keyof JSX.IntrinsicElements;
    class ?: string;
}

const Text : Component<TextProps> = (props) => (
    <Dynamic
        {...getGenericProps(props)}
        component={props.as ?? "p"}
        class={cls(textStyles(props), props.class)}
    >
        {getText(props.content)}
    </Dynamic>
);

export default Text;
export { TextVariants };
