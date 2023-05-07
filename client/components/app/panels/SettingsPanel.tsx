import { Component, For } from "solid-js";
import styles from "./SettingsPanel.module.scss";
import Panel from "../../surfaces/Panel";
import Text from "../../typography/Text";
import Button from "../../controls/Button";
import { languages } from "../../../languages/languages";
import { language, setLocale } from "../../../utils/system/intl";
import { setTheme, theme, themes } from "../../../App";

const SettingsPanelContent : Component = () => (
    <>
        <div class="flex h h-spaced v-center mb3">
            <Text content="Language" />
            <div class={styles.buttonGroup}>
                <For each={Object.entries(languages)}>
                    {([locale, pack]) => <Button
                        content={`${pack.flag} ${pack.name}`}
                        variant={language().locale === locale ? "primary" : "secondary"}
                        onClick={() => setLocale(locale)} />}
                </For>
            </div>
        </div>
        <div class="flex h h-spaced v-center">
            <Text content="Theme" />
            <div class={styles.buttonGroup}>
                <For each={themes}>
                    {(t) => <Button
                        content={`texts.${t}Theme`}
                        variant={theme() === t ? "primary" : "secondary"}
                        onClick={() => setTheme(t)} />}
                </For>
                {/* <Button content="Light" variant={theme() === "light" ? "primary" : "secondary"} onClick={() => setTheme("light")} />
                <Button content="Dark" variant={theme() === "dark" ? "primary" : "secondary"} onClick={() => setTheme("dark")} />
                <Button content="System" /> */}
            </div>
        </div>
    </>
);

const SettingsPanel : Component = () => (
    <Panel>
        <Text content="texts.settings" size="s" uppercase bold faded class="mb3" />
        <SettingsPanelContent />
    </Panel>
);

export default SettingsPanel;
export { SettingsPanelContent };
