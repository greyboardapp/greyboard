import { Component, createMemo } from "solid-js";
import { board } from "../../../core/services/board";
import { viewport } from "../../../core/services/viewport";
import { List, ListItem } from "../../data/List";
import Panel from "../../surfaces/Panel";
import Text from "../../typography/Text";
import styles from "./LabelPanel.module.scss";
import { cls } from "../../../utils/dom/dom";

const LabelPanelContent : Component = () => {
    const itemWithLabels = createMemo(() => Array.from(board.items.values()).filter((item) => !!item.label));

    return (
        <div class={styles.labelPanel}>
            <List each={itemWithLabels()} fallback={<Text content="texts.noLabels" />} flush>
                {(item) => (
                    <ListItem onClick={() => viewport.centerOnPoint(viewport.viewportToBoardRect(item.rect).center)} class={cls(styles.label, "flex h h-spaced v-center")}>
                        <Text content={item.label ?? "texts.unknown"} />
                        <Text class={styles.jump} content="actions.jump" size="s" uppercase bold faded />
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
