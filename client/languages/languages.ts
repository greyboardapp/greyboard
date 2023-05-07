import enTexts from "./en-us.json";
import huTexts from "./hu-hu.json";

export interface LanguageTexts {readonly [key : string] : string}

export interface LanguagePack {
    locale : string;
    name : string;
    flag : string;
    texts : LanguageTexts;
}

export interface LanguageCollection {readonly [key : string] : LanguagePack}

export const languages : LanguageCollection = {
    "en-us": {
        locale: "en-us",
        name: "English",
        flag: "🇺🇸",
        texts: enTexts,
    },
    "hu-hu": {
        locale: "hu-hu",
        name: "Magyar",
        flag: "🇭🇺",
        texts: { ...enTexts, ...huTexts },
    },
};

export const isLocaleValid = (locale : string) : boolean => locale in languages;
