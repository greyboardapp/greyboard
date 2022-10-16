import type { LanguageTexts } from "./languages";

declare module "*.json" {
    const texts : LanguageTexts;
    export default texts;
}