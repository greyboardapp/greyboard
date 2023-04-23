import { Component, Show, createSignal } from "solid-js";
import { createMutation } from "@tanstack/solid-query";
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
import { BoardUpdateData } from "../../../../common/models/board";
import { user } from "../../../utils/system/auth";

interface SharePanelContentProps {
    close : () => void;
}

const SharePanelContent : Component<SharePanelContentProps> = (props) => {
    let shareUrlInput! : HTMLInputElement;
    const [isPublic, setPublic] = createSignal(true);

    const shareMutation = createMutation<ApiResponse, string, BoardUpdateData>(async (properties) : Promise<ApiResponse> => saveBoardData(board.state.id, properties), {
        onSettled: async (data, error, properties) => {
            if (!data || data.error || !data.result) {
                console.error(data?.error);
                return;
            }

            if (properties.isPublic !== undefined) {
                board.state.isPublic = properties.isPublic;

                if (properties.isPublic) {
                    await network.connect(board.state.slug);
                } else {
                    await network.closeBoard();
                    await network.disconnect();
                }
            }
        },
    });

    return (
        <div style={{
            width: "330px",
        }}>
            <Show when={!board.state.isPublic}>
                <Text content="texts.boardNotPublic" italic class="pb2" size="s" />
            </Show>
            <Show when={user()?.id === board.state.author}>
                <FormControl name="texts.publicBoard" inline>
                    {(id) => <Switch id={id} model={[isPublic, setPublic]} />}
                </FormControl>
            </Show>
            <Input ref={shareUrlInput} model={[() => window.location.href, () => {}]} disabled fluid />
            <div class="flex h h-right mt3">
                <Button content="buttons.cancel" variant="secondary" size="s" onClick={() => props.close()} class="mr2" />
                <Button content={user()?.id === board.state.author ? "actions.save" : "buttons.share"} variant="primary" size="s" onClick={() => {
                    window.navigator.clipboard.writeText(shareUrlInput.value);
                    if (user()?.id === board.state.author)
                        if (board.state.isPublic !== isPublic())
                            shareMutation.mutate({
                                isPublic: isPublic(),
                            });
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
