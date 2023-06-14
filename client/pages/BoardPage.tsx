import { Component, onCleanup, onMount, For, Show, untrack, createSignal } from "solid-js";
import { Link, Params, useNavigate, useParams } from "@solidjs/router";
import { createMutation, createQuery } from "@tanstack/solid-query";
import Canvas from "../components/surfaces/Canvas";
import Toolbar from "../components/toolbar/Toolbar";
import ToolbarButton from "../components/toolbar/ToolbarButton";
import Tooltip from "../components/feedback/Tooltip";
import Shortcut from "../components/data/Shortcut";
import Text from "../components/typography/Text";
import ToolbarPopup from "../components/toolbar/ToolbarPopup";
import ToolbarGroup from "../components/toolbar/ToolbarGroup";
import ToolbarDivider from "../components/toolbar/ToolbarDivider";
import ColorPickerPanel from "../components/app/panels/ColorpickerPanel";

import app from "../core/app";
import { toolbox } from "../core/services/toolbox";
import { Tool } from "../core/services/toolbox/tool";

import styles from "./BoardPage.module.scss";
import menuIcon from "../assets/icons/menu.svg";
import paletteIcon from "../assets/icons/palette.svg";
import plusIcon from "../assets/icons/plus.svg";
import minusIcon from "../assets/icons/minus.svg";
import saveIcon from "../assets/icons/save.svg";
import undoIcon from "../assets/icons/undo.svg";
import redoIcon from "../assets/icons/redo.svg";
import layerIcon from "../assets/icons/layer.svg";
import peopleIcon from "../assets/icons/people.svg";
import ToolbarText from "../components/toolbar/ToolbarText";
import { cls, pct } from "../utils/dom/dom";
import { viewport } from "../core/services/viewport";
import ToolbarInput from "../components/toolbar/ToolbarInput";
import { board } from "../core/services/board";
import SelectionBox from "../components/app/SelectionBox";
import LabelPanel from "../components/app/panels/LabelPanel";
import { getBoardContents, getBoardData, saveBoardContents, saveBoardData } from "../api/boards";
import ApiSuspense from "../components/feedback/ApiSuspense";
import { ApiResponse } from "../api/api";
import { hideLoadingOverlay, showLoadingOverlay } from "../components/app/LoadingOverlay";
import Button from "../components/controls/Button";
import Popover from "../components/feedback/Popover";
import SharePanel from "../components/app/panels/SharePanel";
import { showModal } from "../components/surfaces/Modal";
import { network } from "../core/services/network";
import ClientList from "../components/app/ClientAvatars";
import { user } from "../utils/system/auth";
import { BoardAccessTypes, BoardUpdateData, BoardUpdateSchema } from "../../common/models/board";
import { clearToasts, showToast } from "../components/feedback/Toast";
import { getText, formattedRelativeDateTime } from "../utils/system/intl";
import { getMidnightAfterDays } from "../utils/datatypes/date";
import { createWindowListener } from "../utils/dom/hooks";
import TextToolEditor from "../components/app/TextToolEditor";

interface BoardPageParams extends Params {
    slug : string;
}

const BoardPage : Component = () => {
    const params = useParams<BoardPageParams>();
    const navigate = useNavigate();

    const [hubConnectionFailAttemps, setHubConnectionFailAttemps] = createSignal(0);

    const showErrorModal = (error ?: string, title ?: string) : void => showModal({
        title: title ?? "titles.somethingWentWrong",
        content: <>
            <Text content={error ?? "errors.unknown"} />
        </>,
        buttons: [
            (close) => <Button content="buttons.ok" variant="primary" onClick={close} />,
        ],
        size: "s",
    });

    const updateBoardMutation = createMutation({
        mutationFn: async (data : BoardUpdateData) => saveBoardData(board.state.id, data),
        onSettled: (data, error) => {
            if (!data || data.error || data.result === undefined)
                showErrorModal(data?.error);
        },
    });

    const boardDataQuery = createQuery(() => ["board"], async () => getBoardData(params.slug), {
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            untrack(() => {
                if (!data || data.error || !data.result) {
                    showErrorModal(data.error);
                    navigate(user() === null ? "/" : "/dashboard");
                } else {
                    board.loadFromBoardData(data.result);
                    if (data.result.isPublic || data.result.accesses.length > 0)
                        network.connect(data.result.slug, data.result.region);

                    if (data.result.author.id === user()?.id)
                        board.state.isSavingEnabled = true;

                    if (data.result.author.id === user()?.id && data.result.isDeleted)
                        showModal({
                            title: "titles.boardDeleted",
                            content: <Text content="texts.deletedBoardRevert" />,
                            buttons: [
                                (close) => <Button content="buttons.cancel" variant="secondary" onClick={() => {
                                    close();
                                    navigate(user() === null ? "/" : "/dashboard");
                                }} marginRight={2} />,
                                (close) => <Button content="buttons.recover" variant="primary" onClick={async () => {
                                    await updateBoardMutation.mutateAsync({ isDeleted: false });
                                    close();
                                }} />,
                            ],
                        });

                    if (!data.result.isPermanent)
                        showToast({
                            title: `${getText("titles.permanentBoard")} ${formattedRelativeDateTime(getMidnightAfterDays(data.result.modifiedAt, 7))}`,
                            closable: true,
                            actions: [
                                (close) => <Button content="buttons.makePermanent" variant="primary" onClick={async () => {
                                    if (!data.result)
                                        return;

                                    await updateBoardMutation.mutateAsync({
                                        isPermanent: true,
                                    });
                                    close();
                                }} />,
                            ],
                        });
                }
            });

            if (!data.result?.isPublic && data.result?.accesses.length === 0)
                hideLoadingOverlay();
        },
        onError: (err) => {
            showErrorModal();
            navigate(user() === null ? "/" : "/dashboard");
        },
    });

    const saveContentMutation = createMutation(async () : Promise<ApiResponse<string>> => saveBoardContents(board.state.id, board.serialize()), {
        onSettled: (data, error) => {
            if (!data || data.error || !data.result) {
                showErrorModal(data?.error);
                return;
            }

            board.state.lastSaveDate = new Date(data.result);
        },
    });

    const saveBoardDataMutation = createMutation<ApiResponse, string, BoardUpdateData>(async (properties) : Promise<ApiResponse> => saveBoardData(board.state.id, properties), {
        onSettled: async (data, error, properties) => {
            if (!data || data.error || !data.result) {
                console.error(data?.error);
                return;
            }

            if (properties.name !== undefined) {
                board.state.name = properties.name;
                network.setBoardName(properties.name);
            }
        },
    });

    const saveBoard = async () : Promise<void> => {
        await saveContentMutation.mutateAsync();
        const thumbnail = await board.getBoardThumbnail();
        if (thumbnail)
            await saveBoardDataMutation.mutateAsync({ thumbnail });
    };

    onMount(() => {
        app.start();
        board.onBoardReadyToSave.add(saveBoard);
        network.onConnected.add(hideLoadingOverlay);
        network.onConnectionFailed.add(() => {
            hideLoadingOverlay();
            showToast({
                title: "errors.hubConnectionFailed",
                isError: true,
                closable: true,
                actions: untrack(hubConnectionFailAttemps) < 4 ? [
                    (close) => <Button content="buttons.tryAgain" variant="secondary" onClick={async () => {
                        const isConnected = await network.connect(board.state.slug, board.state.region);
                        close();
                        if (isConnected)
                            setHubConnectionFailAttemps(0);
                        else
                            setHubConnectionFailAttemps(hubConnectionFailAttemps() + 1);
                    }} />,
                ] : undefined,
            }, 60000);
        });
        network.onConnectionLost.add(() => {
            showToast({
                title: "errors.hubConnectionLost",
                isError: true,
                closable: true,
            });
        });
        network.onReconnected.add(() => {
            showToast({
                title: "errors.hubReconnected",
                closable: true,
            });
        });
        network.onClientReassigned.add(() => {
            showErrorModal("errors.hubClientReassigned", "titles.oops");
        });
        network.onClientBoardClosed.add(() => {
            showErrorModal("errors.boardClosed", "titles.oops");
            navigate(user() === null ? "/" : "/dashboard");
        });
        network.onDisconnected.add(() => showToast({
            title: "texts.networkDisconnected",
        }));
        network.onClientReloadBoard.add(async () => {
            showLoadingOverlay("");
            const data = await getBoardContents(board.state.id);
            hideLoadingOverlay();

            if (!data.result) {
                showErrorModal(data.error);
                return;
            }

            board.loadContents(data.result);
        });
        network.onClientAccessTypeChanged.add((oldAccessType, newAccessType) => showToast({
            title: `${getText("texts.accessTypeChanged")} ${getText(BoardAccessTypes[newAccessType])?.toLowerCase()}`,
        }));

        clearToasts();
    });

    onCleanup(async () => {
        if (board.canSave())
            await saveBoard();
        app.stop();
        clearToasts();
    });

    createWindowListener("beforeunload", (event) : boolean => {
        if (board.canSave()) {
            event.preventDefault();
            saveBoard();
            return true;
        }
        return false;
    }, { capture: true });

    return (
        <>
            <Canvas />
            <ApiSuspense query={boardDataQuery}>
                {(data) => <div class={styles.ui}>
                    <SelectionBox />
                    <TextToolEditor />
                    <div class="flex h h-spaced v-center">
                        <Toolbar class={styles.interactable} variant="top">
                            <Link href="/dashboard"><ToolbarButton icon={menuIcon} /></Link>
                            <ToolbarInput model={[() => board.state.name, (v) => (board.state.name = v)]} onChange={async (e, name) => {
                                const parsed = BoardUpdateSchema.safeParse({ name });
                                if (!parsed.success) {
                                    showToast({ title: parsed.error.issues[0].message, isError: true, closable: true }, 5000);
                                    return false;
                                }
                                saveBoardDataMutation.mutate(parsed.data);
                                return true;
                            }} disabled={!board.canModify()} />
                            <Tooltip content={<><Text content="actions.save" size="s" uppercase bold as="span" /> <Shortcut shortcut={app.save.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                <ToolbarButton icon={saveIcon} onClick={app.save} disabled={!app.save.when()} />
                            </Tooltip>
                            <Tooltip content={<><Text content="actions.undo" size="s" uppercase bold as="span" /> <Shortcut shortcut={app.undo.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                <ToolbarButton icon={undoIcon} onClick={app.undo} disabled={!app.undo.when()} />
                            </Tooltip>
                            <Tooltip content={<><Text content="actions.redo" size="s" uppercase bold as="span" /> <Shortcut shortcut={app.redo.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                <ToolbarButton icon={redoIcon} onClick={app.redo} disabled={!app.redo.when()} />
                            </Tooltip>
                        </Toolbar>
                        <div class={cls(styles.interactable, "flex h pr2 v-center")}>
                            <Show when={network.state.user} keyed>
                                {(loggedInUser) => <ClientList users={network.state.clients} me={loggedInUser.id} paddingRight={2} />}
                            </Show>
                            <Popover actuator={<Button icon={peopleIcon} content="buttons.share" variant="primary" size="m" />} orientation="right">
                                {(close) => <SharePanel close={close} />}
                            </Popover>
                        </div>
                    </div>
                    <Toolbar variant="left">
                        <ToolbarGroup variant="vertical">
                            <For each={toolbox.state.toolHierarchy}>
                                {(entry) => {
                                    if (entry instanceof Tool)
                                        return (
                                            <Tooltip content={<><Text content={entry.name} size="s" uppercase bold as="span" /> <Shortcut shortcut={entry.shortcut} /></>} orientation="horizontal" variant="panel" offset={5}>
                                                <ToolbarButton icon={entry.icon} active={toolbox.state.selectedTool === entry} onClick={() => (toolbox.state.selectedTool = entry)} />
                                            </Tooltip>
                                        );
                                    return (
                                        <ToolbarPopup
                                            alignment="center"
                                            active={!!toolbox.state.selectedTool && entry.tools.includes(toolbox.state.selectedTool)}
                                            actuator={
                                                <Show when={entry.lastUsedTool} keyed>
                                                    <Tooltip content={<><Text content={entry.lastUsedTool.name} size="s" uppercase bold as="span" /> <Shortcut shortcut={entry.lastUsedTool.shortcut} /></>} orientation="horizontal" variant="panel" offset={5} disabled={toolbox.state.selectedTool && entry.tools.includes(toolbox.state.selectedTool)}>
                                                        <ToolbarButton icon={entry.lastUsedTool.icon} active={toolbox.state.selectedTool && entry.tools.includes(toolbox.state.selectedTool)} onClick={() => (toolbox.state.selectedTool = entry.lastUsedTool)} />
                                                    </Tooltip>
                                                </Show>
                                            }
                                        >
                                            <Toolbar variant="floating">
                                                <For each={entry.tools}>
                                                    {(tool) => (
                                                        <Tooltip content={<><Text content={tool.name} size="s" uppercase bold as="span" /> <Shortcut shortcut={tool.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                                            <ToolbarButton icon={tool.icon} active={toolbox.state.selectedTool === tool} onClick={() => (toolbox.state.selectedTool = entry.lastUsedTool = tool)} />
                                                        </Tooltip>
                                                    )}
                                                </For>
                                            </Toolbar>
                                        </ToolbarPopup>
                                    );
                                }}
                            </For>
                            <ToolbarDivider />
                            <ToolbarPopup
                                alignment="top"
                                actuator={<ToolbarButton icon={paletteIcon} />}
                            >
                                <ColorPickerPanel />
                            </ToolbarPopup>
                        </ToolbarGroup>
                        <ToolbarGroup variant="vertical">
                            <Tooltip content={<><Text content="actions.zoomIn" size="s" uppercase bold as="span" /> <Shortcut shortcut={viewport.zoomIn.shortcut} /></>} orientation="horizontal" variant="panel" offset={5}>
                                <ToolbarButton icon={plusIcon} onClick={viewport.zoomIn} />
                            </Tooltip>
                            <ToolbarText content={pct(viewport.state.scale, true)} />
                            <Tooltip content={<><Text content="actions.zoomOut" size="s" uppercase bold as="span" /> <Shortcut shortcut={viewport.zoomOut.shortcut} /></>} orientation="horizontal" variant="panel" offset={5}>
                                <ToolbarButton icon={minusIcon} onClick={viewport.zoomOut} />
                            </Tooltip>
                            <ToolbarDivider />
                            <ToolbarPopup
                                alignment="bottom"
                                actuator={
                                    <ToolbarButton icon={layerIcon} />
                                }
                            >
                                <LabelPanel />
                            </ToolbarPopup>
                        </ToolbarGroup>
                    </Toolbar>
                    <svg class={styles.innerCorner} width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0H0V10C0 4.47715 4.47715 0 10 0Z" fill="currentColor"></path>
                    </svg>
                </div>}
            </ApiSuspense>
        </>
    );
};
export default BoardPage;
