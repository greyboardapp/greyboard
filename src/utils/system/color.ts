export default class Color {
    static UIntToHex(color : number) : string {
        return `#${color.toString(16)}`;
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

    static RgbaToUint(...color : [number, number, number, number]) : number {
        return ((color[0] << 24) + (color[1] << 16) + (color[2] << 8) + color[3]) >>> 0;
    }

    static withAlpha(color : number, alpha : number) : number {
        return ((color & 0xFFFFFF00) >>> 0) + alpha;
    }
}
