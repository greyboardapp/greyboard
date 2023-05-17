import TimeAgo, { FormatStyleName, Style } from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import hu from "javascript-time-ago/locale/hu";
import { createEffect, createMemo, createSignal } from "solid-js";
import { isLocaleValid, languages, LanguageTexts } from "../../languages/languages";

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(hu);

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

export const formattedTime = (date : number | Date, options ?: Intl.DateTimeFormatOptions) : string => new Intl.DateTimeFormat(locale(), {
    timeStyle: "medium",
    ...options,
}).format((typeof date === "number") ? new Date(date * 1000) : date);

export const formattedDate = (date : number | Date, options ?: Intl.DateTimeFormatOptions) : string => new Intl.DateTimeFormat(locale(), {
    dateStyle: "medium",
    ...options,
}).format((typeof date === "number") ? new Date(date * 1000) : date);

export const formattedRelativeDateTime = (date : number | Date, style : FormatStyleName | Style = "round-minute") : string => new TimeAgo(locale().replace(/-.*/, ""))
    .format((typeof date === "number") ? new Date(date * 1000) : date, style);

export const formattedList = (values : Iterable<string>, options ?: Intl.ListFormatOptions) : string => new Intl.ListFormat(locale(), {
    style: "long",
    type: "conjunction",
    ...options,
}).format(values);

export const formattedNumber = (value : number | bigint, options ?: Intl.NumberFormatOptions) : string => new Intl.NumberFormat(locale(), {
    compactDisplay: "short",
    notation: "standard",
    ...options,
}).format(value);

export { language, locale, setLocale };
