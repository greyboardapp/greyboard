import { Component, onCleanup, onMount, For, Show, createEffect, createSignal, untrack } from "solid-js";
import { Link, Params, useParams } from "@solidjs/router";
import { createQuery } from "@tanstack/solid-query";
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
import undoIcon from "../assets/icons/undo.svg";
import redoIcon from "../assets/icons/redo.svg";
import layerIcon from "../assets/icons/layer.svg";
import ToolbarText from "../components/toolbar/ToolbarText";
import { pct } from "../utils/dom/dom";
import { viewport } from "../core/services/viewport";
import ToolbarInput from "../components/toolbar/ToolbarInput";
import { board } from "../core/services/board";
import SelectionBox from "../components/app/SelectionBox";
import LabelPanel from "../components/app/panels/LabelPanel";
import { getBoardData, saveBoard } from "../api/boards";
import BoardLoading from "../components/app/BoardLoading";
import ApiSuspense from "../components/feedback/ApiSuspense";
import { ApiResponse } from "../api/api";

interface BoardPageParams extends Params {
    slug : string;
}

const BoardPage : Component = () => {
    const params = useParams<BoardPageParams>();
    const boardDataQuery = createQuery(() => ["board"], async () => getBoardData(params.slug), {
        refetchOnWindowFocus: false,
    });

    const [isSavingEnabled, setSavingEnabled] = createSignal(false);
    createQuery(() => ["boardSave"], async () : Promise<ApiResponse<null>> => saveBoard({
        id: board.state.id,
        name: board.state.name,
        contents: board.serialize(),
    }), {
        get enabled() {
            return isSavingEnabled();
        },
        refetchOnWindowFocus: true,
        refetchInterval: (import.meta.env.BOARD_SAVE_INTERVAL ?? 10) * 1000,
    });

    onMount(() => app.start());
    onCleanup(() => {
        app.stop();
        setSavingEnabled(false);
    });

    createEffect(() => {
        if (boardDataQuery.isLoading || !boardDataQuery.data)
            return;
        untrack(() => {
            const { data } = boardDataQuery;
            if (!data || data.error || !data.result) {
                console.error(data.error);
                return; // TODO: handle error
            }

            board.loadFromBoardData(data.result);
            setSavingEnabled(true);
        });
    });

    return (
        <>
            <Canvas />
            <ApiSuspense query={boardDataQuery} loadingFallback={<BoardLoading />}>
                {(data) => <div class={styles.ui}>
                    <SelectionBox />
                    <div class="flex h h-spaced">
                        <Toolbar variant="top">
                            <Link href="/dashboard"><ToolbarButton icon={menuIcon} /></Link>
                            <ToolbarInput model={[() => board.state.name, (v) => (board.state.name = v)]} />
                            <Tooltip content={<><Text content="actions.undo" size="s" uppercase bold as="span" /> <Shortcut shortcut={app.undo.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                <ToolbarButton icon={undoIcon} onClick={app.undo} disabled={!app.undo.when()} />
                            </Tooltip>
                            <Tooltip content={<><Text content="actions.redo" size="s" uppercase bold as="span" /> <Shortcut shortcut={app.redo.shortcut} /></>} orientation="vertical" variant="panel" offset={5}>
                                <ToolbarButton icon={redoIcon} onClick={app.redo} disabled={!app.redo.when()} />
                            </Tooltip>
                        </Toolbar>
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
