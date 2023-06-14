import { cva, VariantProps } from "class-variance-authority";
import { Component, createSignal, Show } from "solid-js";
import { Link } from "@solidjs/router";
import { createMutation } from "@tanstack/solid-query";
import { Board, BoardUpdateData, BoardUpdateSchema } from "../../../common/models/board";
import { cls } from "../../utils/dom/dom";
import { GenericProps, getGenericProps, getGenericVariants } from "../../utils/dom/props";
import Checkbox from "../controls/Checkbox";
import Text from "../typography/Text";
import LockIcon from "../../assets/icons/lock.svg";
import DeleteIcon from "../../assets/icons/delete.svg";
import PeopleIcon from "../../assets/icons/people.svg";

import styles from "./BoardCard.module.scss";
import ToolbarInput from "../toolbar/ToolbarInput";
import { ApiResponse } from "../../api/api";
import { saveBoardData } from "../../api/boards";
import { getMidnightAfterDays } from "../../utils/datatypes/date";
import IconButton from "../controls/IconButton";
import Tooltip from "../feedback/Tooltip";
import { showToast } from "../feedback/Toast";
import RelativeDateTime from "../typography/RelativeDateTime";
import { user } from "../../utils/system/auth";
import Icon from "./Icon";

const BoardCardVariants = { ...getGenericVariants({}) };
const boardCardStyles = cva(styles.card, {
    variants: BoardCardVariants,
});

interface BoardCardProps extends GenericProps<HTMLDivElement>, VariantProps<typeof boardCardStyles> {
    board : Board;
    onClicked : () => void;
    onSelected : () => void;
    onDeselected : () => void;
    onMadePermanent : () => void;
    onDeleted : () => void;
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
                    <div class={styles.expires}><Text as="span" content="texts.expires" /> <RelativeDateTime date={getMidnightAfterDays(props.board.modifiedAt, 7)} /></div>
                </Show>
                <div class={styles.content}>
                    <Show
                        when={props.board.thumbnail.length > 0}
                        fallback={<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />}
                    >
                        <img src={`data:image/png;base64,${props.board.thumbnail}`} alt="" />
                    </Show>
                </div>
            </Link>
            <div class={styles.info}>
                <div class={cls(styles.infoSide, styles.filled)}>
                    <Show when={props.board.author.id === user()?.id} fallback={
                        <Tooltip content={<Text content="texts.sharedBoard" />} orientation="vertical">
                            <Icon icon={PeopleIcon} class="mr2" />
                        </Tooltip>
                    }>
                        <Checkbox model={[selected, (value) => {
                            setSelected(value);
                            if (value)
                                props.onSelected();
                            else
                                props.onDeselected();
                        }]} marginRight={2} />
                    </Show>
                    <ToolbarInput class={styles.filled} model={[() => props.board.name, (v) => (props.board.name = v)]} onChange={async (e, name) => {
                        const parsed = BoardUpdateSchema.safeParse({ name });
                        if (!parsed.success) {
                            showToast({ title: parsed.error.issues[0].message, isError: true, closable: true }, 5000);
                            return false;
                        }
                        saveBoardDataMutation.mutate(parsed.data);
                        return true;
                    }} disabled={props.board.author.id !== user()?.id} />
                </div>
                <Show when={props.board.author.id === user()?.id}>
                    <div class={cls(styles.infoSide, styles.actions)}>
                        <Show when={!props.board.isPermanent}>
                            <Tooltip content={<Text content="buttons.makePermanent" />} orientation="vertical">
                                <IconButton icon={LockIcon} variant="tertiary" size="s" onClick={() => props.onMadePermanent()} />
                            </Tooltip>
                        </Show>
                        <Tooltip content={<Text content="actions.delete" />} orientation="vertical">
                            <IconButton icon={DeleteIcon} variant="tertiary" size="s" onClick={() => props.onDeleted()} />
                        </Tooltip>
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default BoardCard;
