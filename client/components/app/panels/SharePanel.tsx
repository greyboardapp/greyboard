import { Component, For, Show, createSignal, onMount } from "solid-js";
import { createMutation } from "@tanstack/solid-query";
import { createMutable } from "solid-js/store";
import Button from "../../controls/Button";
import Input from "../../controls/Input";
import Switch from "../../controls/Switch";
import FormControl from "../../forms/FormControl";
import Panel from "../../surfaces/Panel";
import Text from "../../typography/Text";
import { board } from "../../../core/services/board";
import { ApiResponse } from "../../../api/api";
import { saveBoardData } from "../../../api/boards";
import { network } from "../../../core/services/network";
import { BoardAccess, BoardAccessType, BoardAccessTypes, BoardUpdateData } from "../../../../common/models/board";
import { user } from "../../../utils/system/auth";
import { showToast } from "../../feedback/Toast";
import Avatar from "../../data/Avatar";
import Select from "../../controls/Select";
import IconButton from "../../controls/IconButton";
import DeleteIcon from "../../../assets/icons/delete.svg";
import styles from "./SharePanel.module.scss";
import { getUser } from "../../../api/users";

interface SharePanelContentProps {
    close : () => void;
}

const SharePanelContent : Component<SharePanelContentProps> = (props) => {
    const [unsavedChanges, setUnsavedChanges] = createSignal(false);
    const [isPublic, setPublic] = createSignal(false);
    const [newUserEmail, setNewUserEmail] = createSignal("");
    const accessList = createMutable<BoardAccess[]>([]);

    onMount(() => {
        setPublic(board.state.isPublic);
        accessList.clear();
        accessList.push(...board.state.accesses.deepCopy());
    });

    function change<T>(fn : (v : T) => void) {
        return (v : T) => { fn(v); setUnsavedChanges(true); };
    }

    const shareMutation = createMutation<ApiResponse, string, BoardUpdateData>(async (properties) : Promise<ApiResponse> => saveBoardData(board.state.id, properties), {
        onSettled: async (data, error, properties) => {
            if (!data || data.error || !data.result) {
                console.error(data?.error);
                return;
            }

            if (properties.isPublic !== undefined) {
                board.state.isPublic = properties.isPublic;
                board.state.accesses = accessList;

                if (properties.isPublic || (properties.accesses?.length ?? 0) > 0) {
                    const isConnected = network.connected;
                    if (await network.connect(board.state.slug, board.state.region) && !isConnected)
                        showToast({
                            title: "texts.shared",
                        });

                    await network.accessesModified(accessList);
                } else {
                    await network.closeBoard();
                    await network.disconnect();
                }
            }
        },
    });

    const hasRightsToModify = () : boolean => (user()?.id === board.state.author.id || board.state.accesses.some((access) => access.type === BoardAccessType.Admin && user()?.id === access.user.id));

    return (
        <div class={styles.sharePanel}>
            <Show when={hasRightsToModify()}>
                <FormControl name="texts.anyoneWithLink" inline>
                    {(id) => <Switch id={id} model={[isPublic, change(setPublic)]} />}
                </FormControl>
            </Show>
            <Input type="email" model={[newUserEmail, setNewUserEmail]} onChange={async () => {
                if (newUserEmail().length === 0 || board.state.author.email === newUserEmail())
                    return;

                const result = await getUser(newUserEmail());

                if (!result || result.error || !result.result) {
                    console.error(result?.error);
                    showToast({
                        title: "no user",
                        isError: true,
                    });
                    return;
                }

                if (accessList.find((access) => access.user.id === result.result?.id)) {
                    showToast({
                        title: "user already added",
                    });
                    return;
                }

                accessList.push({
                    id: "",
                    board: board.state.id,
                    type: BoardAccessType.Viewer,
                    user: result.result,
                });

                setNewUserEmail("");
                setUnsavedChanges(true);
            }} placeholder="texts.addPeoplePlaceholder" fluid />
            <div class="mt3">
                <Text content="texts.peopleWithAccess" marginBottom={3} />
                <div class="flex h v-center h-spaced">
                    <div class="flex h v-center">
                        <Avatar user={board.state.author} marginRight={2} />
                        <div>
                            <Text content={board.state.author.name} />
                            <Text content={board.state.author.email} faded />
                        </div>
                    </div>
                    <Text content="texts.owner" faded />
                </div>
                <For each={accessList}>
                    {(access, i) => (
                        <div class="flex h v-center h-spaced mt3">
                            <div class="flex h v-center">
                                <Avatar user={access.user} marginRight={2} />
                                <div>
                                    <Text content={access.user.name} />
                                    <Text content={access.user.email} faded />
                                </div>
                            </div>
                            <div class="flex h v-center">
                                <Show when={hasRightsToModify()} fallback={<Text content={BoardAccessTypes[access.type]} faded />}>
                                    <Select model={[() => access.type, change((v) => { access.type = v; })]} options={BoardAccessTypes.map((item, accessIndex) => ({
                                        content: <Text content={item} />,
                                        value: accessIndex,
                                    }))} />
                                    <IconButton icon={DeleteIcon} variant="tertiary" size="s" marginLeft={2} onClick={() => { accessList.splice(i(), 1); setUnsavedChanges(true); }} />
                                </Show>
                            </div>
                        </div>
                    )}
                </For>
            </div>
            <div class="flex h h-right v-center mt3">
                <Show when={unsavedChanges()}>
                    <Text content="texts.unsavedChanges" faded italic marginRight={3} />
                </Show>
                <Button content="buttons.cancel" variant="secondary" size="s" onClick={() => props.close()} class="mr2" />
                <Button content={hasRightsToModify() ? "actions.save" : "buttons.share"} variant="primary" size="s" onClick={() => {
                    if (hasRightsToModify())
                        if (unsavedChanges()) {
                            if (board.state.isPublic !== isPublic())
                                window.navigator.clipboard.writeText(window.location.href);

                            shareMutation.mutate({
                                isPublic: isPublic(),
                                accesses: accessList.map((access) => ({ type: access.type, user: access.user.id })),
                            });
                        }
                    props.close();
                }} />
            </div>
        </div>
    );
};

const SharePanel : Component<SharePanelContentProps> = (props) => (
    <Panel>
        <SharePanelContent close={props.close} />
    </Panel>
);

export default SharePanel;
export { SharePanelContent };
