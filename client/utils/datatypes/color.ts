import { floor, round } from "../math/math";

export default class Color {
    static UIntToHex(color : number) : string {
        return `#${color.toString(16).padStart(8, "0")}`;
    }

    static UIntToRGBA(color : number) : [number, number, number, number] {
        return [(color & 0xFF000000) >>> 24, (color & 0x00FF0000) >>> 16, (color & 0x0000FF00) >>> 8, color & 0x000000FF];
    }

    static UIntToNormalizedRGBA(color : number) : [number, number, number, number] {
        return [((color & 0xFF000000) >>> 24) / 255, ((color & 0x00FF0000) >>> 16) / 255, ((color & 0x0000FF00) >>> 8) / 255, (color & 0x000000FF) / 255];
    }

    static HexToUInt(color : string) : number {
        let hex = color.substring(1);
        if (hex.length === 6)
            hex += "FF";
        return parseInt(hex, 16);
    }

    static RGBAToUInt(...color : [number, number, number, number]) : number {
        return ((color[0] << 24) + (color[1] << 16) + (color[2] << 8) + color[3]) >>> 0;
    }

    static HSVToRGBA(h : number, s : number, v : number) : [number, number, number, number] {
        h *= 6;
        const hh = floor(h);
        const b = v * (1 - s);
        const c = v * (1 - (h - hh) * s);
        const d = v * (1 - (1 - h + hh) * s);
        const m = hh % 6;
        return [
            round([v, c, b, b, d, v][m] * 255),
            round([d, v, v, c, b, b][m] * 255),
            round([b, b, d, v, v, c][m] * 255),
            255,
        ];
    }

    static HSVToUInt(h : number, s : number, v : number) : number {
        return this.RGBAToUInt(...this.HSVToRGBA(h, s, v));
    }

    static RGBAToHSV(...color : [number, number, number, number]) : [number, number, number] {
        const [r, g, b] = color;
        const max = Math.max(r, g, b);
        const delta = max - Math.min(r, g, b);
        let hh = 0;
        if (delta)
            if (max === r)
                hh = (g - b) / delta;
            else if (max === g)
                hh = 2 + (b - r) / delta;
            else
                hh = 4 + (r - g) / delta;

        return [
            (60 * (hh < 0 ? hh + 6 : hh)) / 360,
            max ? delta / max : 0,
            max / 255,
        ];
    }

    static UIntToHSV(color : number) : [number, number, number] {
        return this.RGBAToHSV(...this.UIntToRGBA(color));
    }

    static withAlpha(color : number, alpha : number) : number {
        return ((color & 0xFFFFFF00) >>> 0) + alpha;
    }
}
