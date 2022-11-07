import { cva, VariantProps } from "class-variance-authority";
import { Component, JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { LanguageTexts } from "../../languages/languages";
import { cls } from "../../utils/dom/dom";
import { getText } from "../../utils/system/intl";
import { throwError } from "../../utils/system/misc";
import { TextVariants } from "./Text";

const titleStyles = cva("", {
    variants: TextVariants,
    defaultVariants: {
        size: "m",
        uppercase: false,
        faded: false,
        bold: true,
    },
});

const sizes : Record<keyof typeof TextVariants.size, keyof JSX.IntrinsicElements> = {
    xs: "h5",
    s: "h4",
    m: "h3",
    l: "h2",
    xl: "h1",
};

interface TitleProps extends VariantProps<typeof titleStyles> {
    key ?: keyof LanguageTexts;
    content ?: string;
    class ?: string;
}

const Title : Component<TitleProps> = (props) => {
    const heading = () : keyof JSX.IntrinsicElements => sizes[props.size ?? "xl"];

    return (
        <Dynamic
            component={heading()}
            class={cls(titleStyles(props), props.class)}
        >
            {getText(props.content)}
        </Dynamic>
    );
};

export default Title;
