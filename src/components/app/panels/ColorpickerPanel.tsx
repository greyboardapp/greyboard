import { Component, For } from "solid-js";
import { toolbox } from "../../../core/services/toolbox";
import Button from "../../controls/Button";
import Slider from "../../controls/Slider";
import ColorPicker from "../../data/ColorPicker";
import ColorSwatch from "../../data/ColorSwatch";
import FormControl from "../../forms/FormControl";
import Grid from "../../layout/Grid";
import Panel from "../../surfaces/Panel";

const ColorPickerPanelContent : Component = () => (
    <>
        <FormControl name="titles.strokeWeight">
            {(id) => <Slider id={id} min={1} max={10} model={[() => toolbox.state.selectedWeight, (v) => (toolbox.state.selectedWeight = v)]} showValue />}
        </FormControl>

        <FormControl name="titles.color">
            {(id) => (
                <>
                    <Grid class="mb3">
                        <For each={toolbox.state.colorPalette}>
                            {(color, index) => (
                                <ColorSwatch
                                    // Disabled since we know for a fact that the order of the colors will not change
                                    // eslint-disable-next-line solid/reactivity
                                    model={[() => color, (v) => (toolbox.state.selectedColorIndex = index())]}
                                    active={toolbox.state.selectedColorIndex === index()}
                                />
                            )}
                        </For>
                    </Grid>
                    <ColorPicker model={[toolbox.state.selectedColor, toolbox.updateSelectedColorValue]} />
                </>
            )}
        </FormControl>

        <Button content="buttons.resetPalette" size="s" variant="tertiary" fluent onClick={() => toolbox.resetColorPalette()} />
    </>
);

const ColorPickerPanel : Component = () => (
    <Panel>
        <ColorPickerPanelContent />
    </Panel>
);

export default ColorPickerPanel;
export { ColorPickerPanelContent };
