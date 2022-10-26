import { createEffect, createMemo, createSignal } from "solid-js";
import { isLocaleValid, languages, LanguageTexts } from "../languages/languages";

const STORAGE_KEY = "language-locale";

let languageLocale = localStorage.getItem(STORAGE_KEY) ?? window.navigator.language.toLowerCase() ?? "en-us";
if (!isLocaleValid(languageLocale))
    languageLocale = "en-us";

const [locale, setLocale] = createSignal(languageLocale);
const language = createMemo(() => languages[locale()]);

createEffect(() => {
    if (!isLocaleValid(locale()))
        setLocale("en-us");
    localStorage.setItem(STORAGE_KEY, locale());
});

export const getText = (key : keyof LanguageTexts) : string | undefined => {
    if (!(key in language().texts))
        console.warn(`Language key '${key}' not found.`);
    return language().texts[key];
};
export { language, locale, setLocale };
