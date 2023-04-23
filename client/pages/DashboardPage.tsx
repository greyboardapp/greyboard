import { Link, useNavigate } from "@solidjs/router";
import { Component, For, Show } from "solid-js";
import { createMutation, createQuery } from "@tanstack/solid-query";
import Button from "../components/controls/Button";
import Avatar from "../components/data/Avatar";
import Text from "../components/typography/Text";
import { isLoggedIn, setUser, user } from "../utils/system/auth";

import styles from "./DashboardPage.module.scss";
import CarretIcon from "../assets/icons/carret.svg";
import PeopleIcon from "../assets/icons/people.svg";
import SettingsIcon from "../assets/icons/settings.svg";
import LogoutIcon from "../assets/icons/logout.svg";
import PlusIcon from "../assets/icons/plus.svg";
import ReloadIcon from "../assets/icons/reload.svg";
import HintArrow from "../assets/misc/hint_arrow.svg";
import BoardCard from "../components/data/BoardCard";
import { createBoard, getUserBoards } from "../api/boards";
import { cls } from "../utils/dom/dom";
import Popover from "../components/feedback/Popover";
import Panel from "../components/surfaces/Panel";
import { List, ListItem } from "../components/data/List";
import ApiSuspense from "../components/feedback/ApiSuspense";
import { BoardCreationData } from "../../common/models/board";
import { getText } from "../utils/system/intl";
import Skeleton from "../components/feedback/Skeleton";
import IconButton from "../components/controls/IconButton";
import { hideLoadingOverlay, showLoadingOverlay } from "../components/app/LoadingOverlay";
import { logout } from "../api/auth";
import { showModal } from "../components/surfaces/Modal";
import Logo from "../assets/branding/logo.svg";

const DashboardPage : Component = () => {
    const navigate = useNavigate();
    if (!isLoggedIn())
        navigate("/");

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

    return (
        <>
            <Show when={user()} keyed>
                {(loggedInUser) => (
                    <div class={styles.container}>
                        <div class="container px2 m:px0">
                            <div class={cls(styles.logo, "flex h h-center v-center py3 m:py4")}>
                                <Logo /><Text content="Greyboard" size={"xl"} bold class="ml2" />
                            </div>
                            <div class="flex h h-spaced pt2 m:pt4 pb4">
                                <Popover
                                    actuator={<div class={styles.userInfo}>
                                    <CarretIcon />
                                    <Avatar user={loggedInUser} />
                                    <Text content={loggedInUser.name} size="l" />
                                </div>}
                                >
                                    <Panel size="s">
                                        <List>
                                            <ListItem><PeopleIcon /><Text content="Profile" /></ListItem>
                                            <ListItem><SettingsIcon /><Text content="Settings" /></ListItem>
                                            <ListItem onClick={async () => {
                                                logout();
                                                setUser(null);
                                                navigate("/");
                                            }}><LogoutIcon /><Text content="Logout" /></ListItem>
                                        </List>
                                    </Panel>
                                </Popover>
                                <div class="flex">
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
                                                <Link href={`/b/${board.slug}`} class="col">
                                                    <BoardCard board={board} onClicked={() => showLoadingOverlay("board.loading")} />
                                                </Link>
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
