import { createUniqueId, JSX } from "solid-js";
import Text from "../typography/Text";

import styles from "./FormControl.module.scss";

interface FormControlProps<T extends JSX.Element> {
    name : string;
    disabled ?: boolean;
    children : (id : string) => T;
}

function FormControl<T extends JSX.Element>(props : FormControlProps<T>) : JSX.Element {
    const id = createUniqueId();

    return (
        <div class={styles.formControl}>
            <label for={id}><Text content={props.name} size="s" uppercase bold /></label>
            {props.children(id)}
        </div>
    );
}

export default FormControl;
