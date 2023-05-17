import { cva, VariantProps } from "class-variance-authority";
import { Component, createEffect, createSignal } from "solid-js";
import { FormatStyleName, Style } from "javascript-time-ago";
import { LanguageTexts } from "../../languages/languages";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps } from "../../utils/dom/props";
import { formattedRelativeDateTime } from "../../utils/system/intl";
import { TextVariants } from "./Text";

const relativeDateTimeStyles = cva("", {
    variants: TextVariants,
    defaultVariants: {
        size: "m",
        uppercase: false,
        faded: false,
        bold: true,
    },
});

interface TitleProps extends GenericProps<HTMLHeadingElement>, VariantProps<typeof relativeDateTimeStyles> {
    key ?: keyof LanguageTexts;
    date : Date | number;
    format ?: FormatStyleName | Style;
    class ?: string;
}

const RelativeDateTime : Component<TitleProps> = (props) => {
    let dom! : HTMLTimeElement;
    let timer : number | null = null;

    const [formattedDate, setFormattedDate] = createSignal("");
    const getDateTime = () : number => (props.date instanceof Date ? props.date.getTime() : props.date);

    const update = () : void => {
        setFormattedDate(formattedRelativeDateTime(props.date, props.format));

        if (timer)
            clearTimeout(timer);
        const diff = Math.abs((Date.now() - getDateTime()) / 1000);

        let timeout = 1;
        if (diff < 60)
            timeout = 1;
        else if (diff < 60 * 60)
            timeout = 60;
        else if (diff < 60 * 60 * 60)
            timeout = 60 * 60;

        timer = setTimeout(update, timeout * 1000, null);
    };

    createEffect(update);

    return (
        <time
            {...getGenericProps(props)}
            ref={dom}
            datetime={`${getDateTime()}`}
            class={cls(relativeDateTimeStyles(props), props.class)}
        >
            {formattedDate()}
        </time>
    );
};

export default RelativeDateTime;
