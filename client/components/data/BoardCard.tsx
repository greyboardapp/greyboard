import { cva, VariantProps } from "class-variance-authority";
import { Component, createSignal, Show } from "solid-js";
import { Link } from "@solidjs/router";
import { createMutation } from "@tanstack/solid-query";
import { Board, BoardUpdateData } from "../../../common/models/board";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Checkbox from "../controls/Checkbox";
import Text from "../typography/Text";

import styles from "./BoardCard.module.scss";
import { formattedRelativeDateTime } from "../../utils/system/intl";
import ToolbarInput from "../toolbar/ToolbarInput";
import { ApiResponse } from "../../api/api";
import { saveBoardData } from "../../api/boards";

const BoardCardVariants = { ...getGenericVariants({}) };
const boardCardStyles = cva(styles.card, {
    variants: BoardCardVariants,
});

interface BoardCardProps extends GenericProps<HTMLDivElement>, VariantProps<typeof boardCardStyles> {
    board : Board;
    onClicked : () => void;
    onSelected : () => void;
    onDeselected : () => void;
}

const BoardCard : Component<BoardCardProps> = (props) => {
    const [selected, setSelected] = createSignal(false);

    const saveBoardDataMutation = createMutation<ApiResponse, string, BoardUpdateData>(async (properties) : Promise<ApiResponse> => saveBoardData(props.board.id, properties), {
        onSettled: async (data, error, properties) => {
            if (!data || data.error || !data.result) {
                console.error(data?.error);
                return;
            }

            if (properties.name !== undefined)
                props.board.name = properties.name;
        },
    });

    return (
        <div {...getGenericProps(props)} class={cls(boardCardStyles(props), props.class)}>
            <Link href={`/b/${props.board.slug}`} class={styles.link} onClick={() => props.onClicked()}>
                <Show when={!props.board.isPermanent}>
                    <div class={styles.expires}><Text as="span" content="texts.expires" /> {formattedRelativeDateTime(props.board.modifiedAt + 604800)}</div>
                </Show>
                <div class={styles.content}></div>
            </Link>
            <div class={styles.info}>
                <Checkbox model={[selected, (value) => {
                    setSelected(value);
                    if (value)
                        props.onSelected();
                    else
                        props.onDeselected();
                }]} marginRight={2} />
                <ToolbarInput model={[() => props.board.name, (v) => (props.board.name = v)]} onChange={async (e, name) => saveBoardDataMutation.mutate({ name })} />
            </div>
        </div>
    );
};

export default BoardCard;
