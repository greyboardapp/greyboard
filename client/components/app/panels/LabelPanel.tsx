import { Component, createMemo } from "solid-js";
import { board } from "../../../core/services/board";
import { viewport } from "../../../core/services/viewport";
import Button from "../../controls/Button";
import { List, ListItem } from "../../data/List";
import Panel from "../../surfaces/Panel";
import Text from "../../typography/Text";

const LabelPanelContent : Component = () => {
    const itemWithLabels = createMemo(() => Array.from(board.items.values()).filter((item) => !!item.label));

    return (
        <div style={{
            width: "250px",
        }}>
            <List each={itemWithLabels()} fallback={<Text content="texts.noLabels" />} flush>
                {(item) => (
                    <ListItem>
                        <Text content={item.label ?? "texts.unknown"} />
                        <Button content="actions.jump" size="xs" onClick={() => viewport.centerOnPoint(viewport.viewportToBoardRect(item.rect).center)} />
                    </ListItem>
                )}
            </List>
        </div>
    );
};

const LabelPanel : Component = () => (
    <Panel>
        <Text content="titles.labels" size="s" uppercase bold faded class="mb3" />
        <LabelPanelContent />
    </Panel>
);

export default LabelPanel;
export { LabelPanelContent };
