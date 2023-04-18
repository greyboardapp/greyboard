import { cva, VariantProps } from "class-variance-authority";
import { createUniqueId, JSX } from "solid-js";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Text from "../typography/Text";

import styles from "./FormControl.module.scss";

const FormControlVariants = {
    ...getGenericVariants({}),
    inline: {
        true: styles.inline,
    },
};
const formControlStyles = cva(styles.formControl, {
    variants: FormControlVariants,
    defaultVariants: {
        inline: false,
    },
});

interface FormControlProps<T extends JSX.Element> extends GenericProps<HTMLDivElement>, VariantProps<typeof formControlStyles> {
    name : string;
    disabled ?: boolean;
    children : (id : string) => T;
}

function FormControl<T extends JSX.Element>(props : FormControlProps<T>) : JSX.Element {
    const id = createUniqueId();

    return (
        <div {...getGenericProps(props)} class={cls(formControlStyles(props), props.class)}>
            <label for={id}><Text content={props.name} size="s" uppercase bold /></label>
            {props.children(id)}
        </div>
    );
}

export default FormControl;
