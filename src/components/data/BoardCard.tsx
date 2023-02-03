import { cva, VariantProps } from "class-variance-authority";
import { Component, createSignal } from "solid-js";
import { Board } from "../../models/board";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Checkbox from "../controls/Checkbox";
import Text from "../typography/Text";

import styles from "./BoardCard.module.scss";

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
            <div class="flex h v-center">
                <Checkbox model={[selected, setSelected]} marginRight={3} />
                <Text content={props.board.name} />
            </div>
        </div>
    );
};

export default BoardCard;
