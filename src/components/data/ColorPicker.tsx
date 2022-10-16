import { Component, createEffect, createMemo, createSignal } from "solid-js";
import Point from "../../core/data/geometry/point";
import { cls, pct, rgba } from "../../utils/dom";
import { createWindowListener } from "../../utils/hooks";
import Color from "../../utils/system/color";
import { clamp } from "../../utils/system/math";

import styles from "./ColorPicker.module.scss";

enum Interaction {
    None,
    Saturation,
    Hue,
}

interface ColorPickerProps {
    model : [() => number, (v : number) => void];
}

function getRelativePosition(el : HTMLElement, e : MouseEvent) : Point {
    const rect = el.getBoundingClientRect();
    return new Point(
        clamp((e.pageX - rect.left - (el.ownerDocument.defaultView ?? window).pageXOffset) / rect.width, 0, 1),
        1 - clamp((e.pageY - rect.top - (el.ownerDocument.defaultView ?? window).pageYOffset) / rect.height, 0, 1),
    );
}

const ColorPicker : Component<ColorPickerProps> = (props) => {
    let activeInteraction = Interaction.None;
    let activeTarget : HTMLElement | null = null;

    const [hueValue, setHueValue] = createSignal(0);
    const [saturationValue, setSaturationValue] = createSignal(0);
    const [varianceValue, setVarianceValue] = createSignal(0);

    const hue = createMemo(() => Color.HSVToRGBA(hueValue(), 1, 1));
    const color = createMemo(() => Color.HSVToUInt(hueValue(), saturationValue(), varianceValue()));

    createEffect(() => {
        const [h, s, v] = Color.UIntToHSV(props.model[0]());
        if (activeInteraction !== Interaction.None)
            return;
        setHueValue(h);
        setSaturationValue(s);
        setVarianceValue(v);
    });

    const handlePointerMove = (e ?: MouseEvent) : void => {
        if (!e || !activeTarget || activeInteraction === Interaction.None)
            return;

        e.preventDefault();
        const pos = getRelativePosition(activeTarget, e);

        if (activeInteraction === Interaction.Hue) {
            setHueValue(pos.x);
        } else {
            setSaturationValue(pos.x);
            setVarianceValue(pos.y);
        }
        props.model[1](color());
    };

    const handlePointerDown = (e : MouseEvent, interaction : Interaction) : void => {
        activeInteraction = interaction;
        activeTarget = (e.target as HTMLElement);
        handlePointerMove(e);
    };

    const handlePointerUp = () : void => {
        activeInteraction = Interaction.None;
        activeTarget = null;
    };

    createWindowListener("mousemove", handlePointerMove);
    createWindowListener("mouseup", handlePointerUp);

    return (
        <div class={styles.colorPicker}>
            <div
                class={styles.saturation}
                style={{
                    "background-color": rgba(hue()),
                }}
                onMouseDown={(e) => handlePointerDown(e, Interaction.Saturation)}
            >
                <div
                    class={cls(styles.pointer, styles.rounded)}
                    style={{
                        left: pct(saturationValue()),
                        top: pct(1 - varianceValue()),
                        "background-color": Color.UIntToHex(color()),
                    }}
                ></div>
            </div>
            <div class={styles.hue} onMouseDown={(e) => handlePointerDown(e, Interaction.Hue)}>
                <div
                    class={cls(styles.pointer)}
                    style={{
                        left: pct(hueValue()),
                        "background-color": rgba(hue()),
                    }}
                ></div>
            </div>
        </div>
    );
};
export default ColorPicker;
