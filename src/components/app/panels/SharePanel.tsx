import { Component, createEffect, createMemo, createSignal } from "solid-js";
import { board } from "../../../core/services/board";
import { viewport } from "../../../core/services/viewport";
import Button from "../../controls/Button";
import Input from "../../controls/Input";
import Switch from "../../controls/Switch";
import { List, ListItem } from "../../data/List";
import FormControl from "../../forms/FormControl";
import Panel from "../../surfaces/Panel";
import Text from "../../typography/Text";

const [asd, setAsd] = createSignal(false);

createEffect(() => console.log(asd()));

const SharePanelContent : Component = () => (
    <div style={{
        width: "330px",
    }}>
        <FormControl name="texts.publicBoard" inline>
            {(id) => <Switch id={id} model={[asd, setAsd]} />}
        </FormControl>
        <Input disabled model={[() => window.location.toString(), () => {}]} fluid marginBottom={2} />
        <FormControl name="texts.accessibleOnWhenYouAreIn" inline>
            {(id) => <Switch id={id} model={[asd, setAsd]} />}
        </FormControl>
        <FormControl name="texts.modifiableOnWhenYouAreIn" inline>
            {(id) => <Switch id={id} model={[asd, setAsd]} />}
        </FormControl>
        <div class="flex h h-right mt3">
            <Button content="buttons.cancel" variant="secondary" size="s" marginRight={2} />
            <Button content="buttons.share" variant="primary" size="s" />
        </div>
    </div>
);

const SharePanel : Component = () => (
    <Panel>
        <SharePanelContent />
    </Panel>
);

export default SharePanel;
export { SharePanelContent };
