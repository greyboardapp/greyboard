import { useNavigate } from "@solidjs/router";
import { Component, For, Show, createSignal } from "solid-js";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Motion } from "@motionone/solid";
import Button from "../components/controls/Button";
import Avatar from "../components/data/Avatar";
import Text from "../components/typography/Text";
import { isLoggedIn, setUser, user } from "../utils/system/auth";

import styles from "./DashboardPage.module.scss";
import CarretIcon from "../assets/icons/carret.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import LogoutIcon from "../assets/icons/logout.svg";
import PlusIcon from "../assets/icons/plus.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import DeleteIcon from "../assets/icons/delete.svg";
import LockIcon from "../assets/icons/lock.svg";
import HintArrow from "../assets/misc/hint_arrow.svg";
import BoardCard from "../components/data/BoardCard";
import { createBoard, getUserBoards, saveBoardsData } from "../api/boards";
import { cls } from "../utils/dom/dom";
import Popover from "../components/feedback/Popover";
import Panel from "../components/surfaces/Panel";
import { List, ListItem } from "../components/data/List";
import ApiSuspense from "../components/feedback/ApiSuspense";
import { Board, BoardCreationData, BoardsUpdateData } from "../../common/models/board";
import { getText } from "../utils/system/intl";
import Skeleton from "../components/feedback/Skeleton";
import IconButton from "../components/controls/IconButton";
import { hideLoadingOverlay, showLoadingOverlay } from "../components/app/LoadingOverlay";
import { logout } from "../api/auth";
import { showModal } from "../components/surfaces/Modal";
import Logo from "../assets/branding/logo.svg";
import Divider from "../components/feedback/Divider";
import { showToast } from "../components/feedback/Toast";
import Tooltip from "../components/feedback/Tooltip";
import { SettingsPanelContent } from "../components/app/panels/SettingsPanel";
import Icon from "../components/data/Icon";

const DashboardPage : Component = () => {
    const navigate = useNavigate();
    if (!isLoggedIn())
        navigate("/");

    const [selectedBoards, setSelectedBoards] = createSignal<Board[]>([]);
    const [deletedBoards, setDeletedBoards] = createSignal<string[]>([]);

    const showErrorModal = (error ?: string) : void => showModal({
        title: "titles.somethingWentWrong",
        content: <>
            <Text content={error ?? "errors.unknown"} />
        </>,
        buttons: [
            (close) => <Button content="buttons.ok" variant="primary" onClick={close} />,
        ],
        size: "s",
    });

    const loadingSkeleton = (
        <>
            <div class="col"><Skeleton height={250} /></div>
            <div class="col"><Skeleton height={250} /></div>
            <div class="col"><Skeleton height={250} /></div>
            <div class="col"><Skeleton height={250} /></div>
        </>
    );

    const boardQuery = createQuery(() => ["boards"], getUserBoards, {
        refetchOnWindowFocus: false,
        onSettled: (data, error) => {
            if (!data || data.error || data.result === undefined)
                showErrorModal(data?.error);
        },
    });
    const createBoardMutation = createMutation({
        mutationFn: async (data : BoardCreationData) => createBoard(data),
        onSettled: (data, error) => {
            if (!data || data.error || data.result === undefined)
                showErrorModal(data?.error);
        },
    });

    const updateBoardsMutation = createMutation({
        mutationFn: async (data : BoardsUpdateData) => saveBoardsData(data),
        onSettled: (data, error) => {
            if (!data || data.error || data.result === undefined) {
                showErrorModal(data?.error);
                return;
            }
            setSelectedBoards([]);
        },
    });

    const deleteBoards = async (ids : string[]) : Promise<void> => {
        setDeletedBoards(ids);
        await updateBoardsMutation.mutateAsync({ ids, properties: { isDeleted: true } });
        await boardQuery.refetch();
        showToast({
            title: "texts.boardDeleteUndo",
            actions: [
                (close) => <Button content="actions.undo" variant="primary" onClick={async () => {
                    await updateBoardsMutation.mutateAsync({ ids: deletedBoards(), properties: { isDeleted: false } });
                    await boardQuery.refetch();
                    setDeletedBoards([]);
                    close();
                }} />,
            ],
            closable: true,
        }, 60000);
    };

    return (
        <>
            <Show when={user()} keyed>
                {(loggedInUser) => (
                    <div class={styles.container}>
                        <div class="container px2 m:px0">
                            <div class={cls(styles.logo, "flex h h-center v-center py3 m:py4")}>
                                <Icon icon={Logo} /><Text content="Greyboard" size={"xl"} bold class="ml2" />
                            </div>
                            <div class="flex s:v m:h m:h-spaced py2 m:py4">
                                <Popover
                                    actuator={<div class={styles.userInfo}>
                                        <Icon icon={CarretIcon} />
                                        <Avatar user={loggedInUser} />
                                        <Text content={loggedInUser.name} size="l" />
                                    </div>}
                                    orientation={"left"}
                                >
                                    {(close) => (
                                        <Panel size="s">
                                            <List>
                                                <ListItem onClick={async () => {
                                                    close();
                                                    showModal({
                                                        title: "texts.settings",
                                                        size: "m",
                                                        content: <SettingsPanelContent />,
                                                        buttons: [
                                                            (closeSettings) => <Button content="buttons.close" onClick={closeSettings} />,
                                                        ],
                                                    });
                                                }}><Icon icon={SettingsIcon} /><Text content="texts.settings" /></ListItem>
                                                <ListItem onClick={async () => {
                                                    logout();
                                                    setUser(null);
                                                    navigate("/");
                                                }}><Icon icon={LogoutIcon} /><Text content="buttons.logout" /></ListItem>
                                            </List>
                                        </Panel>
                                    )}
                                </Popover>
                                <div class="flex s:v m:h h-right">
                                    <Show when={selectedBoards().length > 0}>
                                        <Motion.div
                                            initial={{ x: "10%", opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: "10%", opacity: 0 }}
                                            class="flex h h-right v-center s:mt2 m:reset-mt"
                                        >
                                            <div class="mr3">
                                                <Text as="span" content={`${selectedBoards().length} `} />
                                                <Text as="span" content={selectedBoards().length === 1 ? "texts.boardsSelected" : "texts.boardsSelectedPlural"} />
                                            </div>
                                            <div class="mr2">
                                                <Tooltip content={<Text content="buttons.makePermanent" />} orientation="vertical">
                                                    <IconButton icon={LockIcon} variant="tertiary" onClick={async () => {
                                                        await updateBoardsMutation.mutateAsync({ ids: selectedBoards().map((board) => board.id), properties: { isPermanent: true } });
                                                        await boardQuery.refetch();
                                                    }} loading={updateBoardsMutation.isLoading} />
                                                </Tooltip>
                                            </div>
                                            <Tooltip content={<Text content="actions.delete" />} orientation="vertical">
                                                <IconButton icon={DeleteIcon} variant="tertiary" onClick={async () => {
                                                    const ids = selectedBoards().map((board) => board.id);
                                                    deleteBoards(ids);
                                                }} loading={updateBoardsMutation.isLoading} />
                                            </Tooltip>
                                        </Motion.div>
                                        <Divider direction="v" class="mx2 s:hide m:show" />
                                    </Show>
                                    <div class="flex h h-right s:mt2 m:reset-mt">
                                        <IconButton icon={ReloadIcon} variant="tertiary" onClick={async () => boardQuery.refetch()} loading={boardQuery.isLoading} marginRight={2} />
                                        <Button content="board.newPlaceholder" icon={PlusIcon} variant="primary" size="m" onClick={async () => {
                                            showLoadingOverlay("board.creating");

                                            const board = await createBoardMutation.mutateAsync({ name: getText("board.newPlaceholder") ?? "New Board" });
                                            if (board.error) {
                                                console.error(board.error);
                                                hideLoadingOverlay();
                                            }
                                            if (board.result)
                                                navigate(`/b/${board.result.slug}`);
                                        }} />
                                    </div>
                                </div>
                            </div>
                            <div class={cls(styles.content, "row c1 m:c2 l:c3 xl:c4 g3 pb4")}>
                                <ApiSuspense
                                    query={boardQuery}
                                    loadingFallback={loadingSkeleton}
                                    errorFallback={(error) => loadingSkeleton}
                                >
                                    {(boards) => (
                                        <For each={boards} fallback={(
                                            <div class={styles.noBoardsHint}>
                                                <Text content="texts.noBoardsHint" faded />
                                                <HintArrow />
                                            </div>
                                        )}>
                                            {(board) => (
                                                <div class="col">
                                                    <BoardCard
                                                        board={board}
                                                        onClicked={() => showLoadingOverlay("board.loading")}
                                                        onSelected={() => {
                                                            setSelectedBoards([...selectedBoards(), board]);
                                                        }}
                                                        onDeselected={() => {
                                                            const b = selectedBoards().copy();
                                                            b.splice(b.findIndex((v) => v === board), 1);
                                                            setSelectedBoards(b);
                                                        }}
                                                        onMadePermanent={async () => {
                                                            await updateBoardsMutation.mutateAsync({ ids: [board.id], properties: { isPermanent: true } });
                                                            await boardQuery.refetch();
                                                        }}
                                                        onDeleted={async () => {
                                                            deleteBoards([board.id]);
                                                        }}
                                                        />
                                                </div>
                                            )}
                                        </For>
                                    )}
                                </ApiSuspense>
                            </div>
                        </div>
                    </div>
                )}
            </Show>
        </>
    );
};
export default DashboardPage;
