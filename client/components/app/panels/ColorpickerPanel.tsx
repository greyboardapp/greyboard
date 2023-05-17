import { Component, For, Show } from "solid-js";
import { toolbox } from "../../../core/services/toolbox";
import Button from "../../controls/Button";
import Slider from "../../controls/Slider";
import ColorPicker from "../../data/ColorPicker";
import ColorSwatch from "../../data/ColorSwatch";
import FormControl from "../../forms/FormControl";
import Grid from "../../layout/Grid";
import Panel from "../../surfaces/Panel";

interface ColorPickerPanelContentProps {
    showColorPicker ?: boolean;
    activeColor : number;
    sliderModel : [() => number, (v : number) => void];
    weightPicked : (newWeight : number, oldWeight : number) => void;
    colorPicked : (newColor : number, newIndex : number) => void;
}

const ColorPickerPanelContent : Component<ColorPickerPanelContentProps> = (props) => (
    <>
        <FormControl name="titles.strokeWeight">
            {(id) => <Slider id={id} min={1} max={10} model={props.sliderModel} showValue onChange={(e, newValue, oldValue) => props.weightPicked(newValue, oldValue)} />}
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
                                    model={[() => color, (v) => props.colorPicked(color, index())]}
                                    active={color === props.activeColor}
                                />
                            )}
                        </For>
                    </Grid>
                    <Show when={props.showColorPicker}>
                        <ColorPicker model={[toolbox.state.selectedColor, toolbox.updateSelectedColorValue]} />
                    </Show>
                </>
            )}
        </FormControl>

        <Show when={props.showColorPicker}>
            <Button content="buttons.resetPalette" size="s" variant="tertiary" fluent onClick={() => toolbox.resetColorPalette()} />
        </Show>
    </>
);

const ColorPickerPanel : Component = () => (
    <Panel>
        <ColorPickerPanelContent
            showColorPicker={true}
            activeColor={toolbox.state.selectedColor()}
            sliderModel={[() => toolbox.state.selectedWeight, (v) => (toolbox.state.selectedWeight = v)]}
            weightPicked={(newWeight, oldWeight) => {}}
            colorPicked={(color, index) => (toolbox.state.selectedColorIndex = index)}
        />
    </Panel>
);

export default ColorPickerPanel;
export { ColorPickerPanelContent };
