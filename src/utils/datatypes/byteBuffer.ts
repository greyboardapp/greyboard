import Base64 from "base64-js";

export class ByteBuffer extends Uint8Array {
    private head = 0;

    constructor(size = 0) {
        super(size);
    }

    get eod() : boolean {
        return this.head >= this.length;
    }

    static decode(str : string) : ByteBuffer {
        const data = Base64.toByteArray(str);
        const buffer = new ByteBuffer(data.length);
        buffer.set(data);
        return buffer;
    }

    encode() : string {
        return Base64.fromByteArray(this);
    }

    seek(pos : number) : void {
        if (pos < 0 || pos >= this.byteLength)
            throw new RangeError("Position out of bounds");
        this.head = pos;
    }

    tellg() : number {
        return this.head;
    }

    writeByte(v : number) : number {
        if (this.head + 1 > this.byteLength)
            throw new RangeError("Index out of range");
        if (v < 0 || v > 255)
            throw new RangeError("'value' is out of range. It must be within [0, 255]");

        this[this.head++] = v;
        return this.head;
    }

    readByte() : number {
        if (this.head + 1 > this.byteLength)
            throw new RangeError("Index out of range");

        this.head++;
        return this[this.head - 1];
    }

    readBytes(n : number) : Uint8Array {
        if (this.head + n > this.byteLength)
            throw new RangeError("Index out of range");
        const b = new ByteBuffer(n);
        const l = this.head + n;
        while (this.head < l)
            b.writeByte(this.readByte());
        return b;
    }

    writeUInt(v : number) : number {
        if (this.head + 4 > this.byteLength)
            throw new RangeError("Index out of range");
        if (v < 0 || v > 0xffffffff)
            throw new RangeError(`'value' is out of range. It must be within [0, ${0xffffffff}]`);

        this[this.head++] = (v >>> 24);
        this[this.head++] = (v >>> 16);
        this[this.head++] = (v >>> 8);
        this[this.head++] = (v);
        return this.head;
    }

    readUInt() : number {
        if (this.head + 4 > this.byteLength)
            throw new RangeError("Index out of range");

        const v = (this[this.head] << 24) + (this[this.head + 1] << 16) + (this[this.head + 2] << 8) + this[this.head + 3];
        this.head += 4;
        return v;
    }

    writeFloat(v : number) : number {
        if (this.head + 4 > this.byteLength)
            throw new RangeError("Index out of range");

        let mLen = 23;
        let e;
        let m;
        let c;
        let eLen = (4 * 8) - mLen - 1;
        const eMax = (1 << eLen) - 1;
        const eBias = eMax >> 1;
        const rt = 2 ** -24 - 2 ** -77;
        let i = 3;
        const d = -1;
        const s = v < 0 || (v === 0 && 1 / v < 0) ? 1 : 0;

        let value = Math.abs(v);

        if (Number.isNaN(value) || value === Infinity) {
            m = Number.isNaN(value) ? 1 : 0;
            e = eMax;
        } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            c = 2 ** -e;
            if (value * c < 1) {
                e--;
                c *= 2;
            }
            if (e + eBias >= 1)
                value += rt / c; else
                value += rt * 2 ** 1 - eBias;
            if (value * c >= 2) {
                e++;
                c /= 2;
            }
            if (e + eBias >= eMax) {
                m = 0;
                e = eMax;
            } else if (e + eBias >= 1) {
                m = ((value * c) - 1) * 2 ** mLen;
                e += eBias;
            } else {
                m = value * 2 ** (eBias - 1) * 2 ** mLen;
                e = 0;
            }
        }
        for (; mLen >= 8; mLen -= 8) {
            this[this.head + i] = m & 0xff;
            i += d;
            m /= 256;
        }
        e = (e << mLen) | m;
        eLen += mLen;
        for (; eLen > 0; eLen -= 8) {
            this[this.head + i] = e & 0xff;
            i += d;
            e /= 256;
        }

        this[this.head + i - d] |= s * 128;
        this.head += 4;
        return this.head;
    }

    readFloat() : number {
        if (this.head + 4 > this.byteLength)
            throw new RangeError("Index out of range");

        const mLen = 23;
        let e;
        let m;
        const eLen = (4 * 8) - mLen - 1;
        const eMax = (1 << eLen) - 1;
        const eBias = eMax >> 1;
        let nBits = -7;
        let i = 0;
        const d = 1;
        let s = this[this.head + i];

        i += d;

        e = s & ((1 << (-nBits)) - 1);
        s >>= (-nBits);
        nBits += eLen;
        for (; nBits > 0; nBits -= 8) {
            e = (e * 256) + this[this.head + i];
            i += d;
        }

        m = e & ((1 << (-nBits)) - 1);
        e >>= (-nBits);
        nBits += mLen;
        for (; nBits > 0; nBits -= 8) {
            m = (m * 256) + this[this.head + i];
            i += d;
        }

        if (e === 0) {
            e = 1 - eBias;
        } else if (e === eMax) {
            return m ? NaN : ((s ? -1 : 1) * Infinity);
        } else {
            m += 2 ** mLen;
            e -= eBias;
        }

        this.head += 4;

        return (s ? -1 : 1) * m * 2 ** (e - mLen);
    }

    writeString(str : string) : number {
        if (this.head + str.length + 1 > this.byteLength)
            throw new RangeError("Index out of range");

        for (const c of str)
            this.writeByte(c.charCodeAt(0));
        this.writeByte(0);
        return this.head;
    }

    readString() : string {
        let str = "";
        let c = this.readByte();
        while (c !== 0) {
            str += String.fromCharCode(c);
            c = this.readByte();
        }
        return str;
    }

    writeFormatted(format : string, ...values : number[]) : number {
        if (format.length !== values.length)
            throw new SyntaxError("The number of values passed does not match the number of values in the format");

        for (let i = 0; i < format.length; i++)
            switch (format[i]) {
                case "b":
                    this.writeByte(values[i]);
                    break;
                case "i":
                    this.writeUInt(values[i]);
                    break;
                case "f":
                    this.writeFloat(values[i]);
                    break;
                default:
                    throw new SyntaxError(`Invalid character '${format[i]}' in format`);
            }

        return this.head;
    }

    readFormatted(format : string) : Array<number> {
        const values : number[] = new Array<number>(format.length);

        for (let i = 0; i < format.length; i++)
            switch (format[i]) {
                case "b":
                    values[i] = this.readByte();
                    break;
                case "i":
                    values[i] = this.readUInt();
                    break;
                case "f":
                    values[i] = this.readFloat();
                    break;
                default:
                    throw new SyntaxError(`Invalid character '${format[i]}' in format`);
            }

        return values;
    }

    append(buffer : Uint8Array) : number {
        this.set(buffer, this.head);
        this.head += buffer.byteLength;
        return this.head;
    }
}
