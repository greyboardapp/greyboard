import { Component } from "solid-js";
import { Board } from "../../models/board";
import Text from "../typography/Text";

import styles from "./BoardCard.module.scss";

interface BoardCardProps {
    board : Board;
    onClicked : () => void;
}

const BoardCard : Component<BoardCardProps> = (props) => (
    <div class={styles.card} onClick={() => props.onClicked()}>
        <Text content={props.board.name} />
    </div>
);

export default BoardCard;
