import { ParentComponent } from "solid-js";
import { cls } from "../../utils/dom";

interface BlockProps {
    class ?: string;
}

const Block : ParentComponent<BlockProps> = (props) => (
    <div class={cls("mb3", props.class)}>{props.children}</div>
);

export default Block;
