import enTexts from "./en-us.json";
import huTexts from "./hu-hu.json";

export interface LanguageTexts {readonly [key : string] : string}

export interface LanguagePack {
    locale : string;
    texts : LanguageTexts;
}

export interface LanguageCollection {readonly [key : string] : LanguagePack}

export const languages : LanguageCollection = {
    "en-us": {
        locale: "en-us",
        texts: enTexts,
    },
    "hu-hu": {
        locale: "hu-hu",
        texts: { ...enTexts, ...huTexts },
    },
};

export const isLocaleValid = (locale : string) : boolean => locale in languages;
