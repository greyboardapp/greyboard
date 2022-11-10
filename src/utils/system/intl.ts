import { createEffect, createMemo, createSignal } from "solid-js";
import { isLocaleValid, languages, LanguageTexts } from "../../languages/languages";

const STORAGE_KEY = "language-locale";
const DEFAULT_LOCALE = "en-us";

let languageLocale = localStorage.getItem(STORAGE_KEY) ?? window.navigator.language.toLowerCase() ?? DEFAULT_LOCALE;
if (!isLocaleValid(languageLocale))
    languageLocale = "en-us";

const [locale, setLocale] = createSignal(languageLocale);
const language = createMemo(() => languages[locale()]);

createEffect(() => {
    if (!isLocaleValid(locale()))
        setLocale("en-us");
    localStorage.setItem(STORAGE_KEY, locale());
});

export const getText = (key ?: keyof LanguageTexts) : string | undefined => {
    if (!key)
        return undefined;

    if (!(key in language().texts)) {
        if (key in languages[DEFAULT_LOCALE].texts)
            return languages[DEFAULT_LOCALE].texts[key];

        return key.toString();
    }

    return language().texts[key];
};
export { language, locale, setLocale };
