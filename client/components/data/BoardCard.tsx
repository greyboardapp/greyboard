import { cva, VariantProps } from "class-variance-authority";
import { Component, createSignal, Show } from "solid-js";
import { Board } from "../../../common/models/board";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Checkbox from "../controls/Checkbox";
import Text from "../typography/Text";

import styles from "./BoardCard.module.scss";
import { formattedRelativeDateTime } from "../../utils/system/intl";

const BoardCardVariants = { ...getGenericVariants({}) };
const boardCardStyles = cva(styles.card, {
    variants: BoardCardVariants,
});

interface BoardCardProps extends GenericProps<HTMLDivElement>, VariantProps<typeof boardCardStyles> {
    board : Board;
    onClicked : () => void;
}

const BoardCard : Component<BoardCardProps> = (props) => {
    const [selected, setSelected] = createSignal(false);
    return (
        <div {...getGenericProps(props)} class={cls(boardCardStyles(props), props.class)} onClick={() => props.onClicked()}>
            <Show when={!props.board.isPermanent}>
                <div class={styles.expires}><Text as="span" content="texts.expires" /> {formattedRelativeDateTime(props.board.createdAt + 604800)}</div>
            </Show>
            <div class={styles.content}>
                <div class="flex h v-center">
                    <Checkbox model={[selected, setSelected]} marginRight={3} />
                    <Text content={props.board.name} />
                </div>
            </div>
        </div>
    );
};

export default BoardCard;
