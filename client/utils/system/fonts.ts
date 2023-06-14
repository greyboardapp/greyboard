import Caveat from "../../assets/fonts/Caveat-Regular.ttf?url";

export const caveat = new FontFace("Caveat", `url(${Caveat})`);

export async function loadFonts() : Promise<void> {
    await document.fonts.load(`16px ${caveat.family}`);
}
