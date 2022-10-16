import { Component, createSignal } from "solid-js";
import ToolbarButton from "../components/toolbar/ToolbarButton";

import styles from "./Components.module.scss";
import cursorIcon from "../assets/icons/cursor.svg";
import peopleIcon from "../assets/icons/people.svg";
import { setTheme, theme } from "../App";
import Toolbar from "../components/toolbar/Toolbar";
import Button from "../components/control/Button";
import Input from "../components/control/Input";
import Slider from "../components/control/Slider";
import ColorPicker from "../components/data/ColorPicker";
import Color from "../utils/system/color";
import Text from "../components/typography/Text";
import { locale, setLocale } from "../utils/intl";
import Title from "../components/typography/Title";

const [str, setStr] = createSignal("Type something");
const [num, setNum] = createSignal(5);

const [color, setColor] = createSignal(0x00FF00FF);

const ComponentsPage : Component = () => (
    <div class={styles.bg}>
        <button onClick={() => setTheme(theme() === "light" ? "dark" : "light")}>Toggle theme</button>
        <h1>Typography</h1>
        <button onClick={() => setLocale(locale() === "en-us" ? "hu-hu" : "en-us")}>Toggle locale</button>
        <Text key="board.newPlaceholder" size="xl" />
        <Text key="board.newPlaceholder" size="l" />
        <Text key="board.newPlaceholder" size="m" />
        <Text key="board.newPlaceholder" size="s" />
        <br />
        <Text key="board.newPlaceholder" size="m" uppercase />
        <Text key="board.newPlaceholder" size="m" faded />
        <Text key="board.newPlaceholder" size="m" uppercase faded />
        <br />
        <br />
        <Title key="board.newPlaceholder" size="xl" class="mb5" />
        <Title key="board.newPlaceholder" size="l" />
        <Title key="board.newPlaceholder" size="m" />
        <Title key="board.newPlaceholder" size="s" />
        <br />
        <Title key="board.newPlaceholder" size="m" uppercase />
        <Title key="board.newPlaceholder" size="m" faded />
        <Title key="board.newPlaceholder" size="m" uppercase faded />

        <h1>Toolbar</h1>
        <ToolbarButton icon={cursorIcon} />
        <ToolbarButton icon={cursorIcon} active />

        <div class={styles.dark}>
            <Toolbar variant="floating">
                <ToolbarButton icon={cursorIcon} active />
                <ToolbarButton icon={cursorIcon} />
                <ToolbarButton icon={cursorIcon} />
                <ToolbarButton icon={cursorIcon} />
            </Toolbar>
        </div>

        <h1>Buttons</h1>
        <Button variant="primary" text="Button" />
        <Button text="Button" />
        <Button variant="transparent" text="Button" />
        <br />
        <Button variant="primary" text="Button" icon={peopleIcon} />
        <Button text="Button" icon={peopleIcon} />
        <Button variant="transparent" text="Button" icon={peopleIcon} />
        <br />
        <br />
        <Button size="big" variant="primary" text="Button" />
        <Button size="big" text="Button" />
        <Button size="big" variant="transparent" text="Button" />
        <br />
        <Button size="big" variant="primary" text="Button" icon={peopleIcon} />
        <Button size="big" text="Button" icon={peopleIcon} />
        <Button size="big" variant="transparent" text="Button" icon={peopleIcon} />

        <h1>Inputs</h1>
        <Input type="text" model={[str, setStr]} />
        <Input type="text" icon={peopleIcon} model={[str, setStr]} />

        <h1>Sliders</h1>
        <Slider model={[num, setNum]} />
        <Slider model={[num, setNum]} showValue />
        <Slider model={[num, setNum]} min={0} max={10} step={0.1} showValue />

        <h1>Color Picker</h1>
        <ColorPicker model={[color, setColor]} />
        <p>{Color.UIntToRGBA(color()).join(", ")}</p>
        <button onClick={() => setColor(Color.RGBAToUInt(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1))}>Random color</button>
    </div>
);

export default ComponentsPage;
