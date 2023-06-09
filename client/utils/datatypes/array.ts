/* eslint-disable func-names */
declare global {
    interface ArrayConstructor {
        repeat<T>(x : T, n : number) : Array<T>;
        repeat<T>(fn : (i : number) => T, n : number) : Array<T>;
    }

    interface Array<T> {
        clear() : void;
        copy() : Array<T>;
        deepCopy() : Array<T>;
        unique() : Array<T>;

        first() : T | undefined;
        last() : T | undefined;

        shallowEquals(other : T[]) : boolean;

        min<V>(key : (t : T) => V) : T | null;
        max<V>(key : (t : T) => V) : T | null;

        groupBy<K extends T[keyof T]>(key : (x : T) => K) : Map<K, Array<T>>;
        groupByToObject<K extends string | number | symbol>(key : (x : T) => K) : Record<K, Array<T>>;
    }
}

Array.prototype.clear = function<T> (this : T[]) : void {
    this.splice(0, this.length);
};

Array.prototype.copy = function<T> (this : T[]) : Array<T> {
    return [...this];
};

Array.prototype.deepCopy = function<T> (this : T[]) : Array<T> {
    return JSON.parse(JSON.stringify(this)) as Array<T>;
};

Array.prototype.unique = function<T> (this : T[]) : Array<T> {
    return [...new Set(this)];
};

Array.prototype.first = function<T> (this : T[]) : T | undefined {
    return this[0];
};

Array.prototype.last = function<T> (this : T[]) : T | undefined {
    return this[this.length - 1];
};

Array.prototype.shallowEquals = function<T> (this : T[], other : T[]) : boolean {
    if (this.length !== other.length)
        return false;

    for (let i = 0; i < this.length; i++)
        if (this[i] !== other[i])
            return false;

    return true;
};

Array.prototype.min = function<T, V> (this : T[], key ?: (t : T) => V) : T | null {
    let m : T | null = null;
    let mValue : T | V | null = null;
    for (const item of this) {
        const value = key ? key(item) : item;
        if (!mValue || value < mValue) {
            m = item;
            mValue = value;
        }
    }
    return m;
};

Array.prototype.max = function<T, V> (this : T[], key ?: (t : T) => V) : T | null {
    let m : T | null = null;
    let mValue : T | V | null = null;
    for (const item of this) {
        const value = key ? key(item) : item;
        if (!mValue || value > mValue) {
            m = item;
            mValue = value;
        }
    }
    return m;
};

Array.prototype.groupBy = function<T, K extends T[keyof T]> (this : T[], key : (x : T) => K) : Map<K, Array<T>> {
    const result : Map<K, T[]> = new Map();
    for (const item of this) {
        const k = key(item);
        const collection = result.get(k);
        if (!collection)
            result.set(k, [item]);
        else
            collection.push(item);
    }
    return result;
};

Array.prototype.groupByToObject = function<T, K extends string | number | symbol> (this : T[], key : (x : T) => K) : Record<K, Array<T>> {
    const result : Record<K, Array<T>> = {} as Record<K, Array<T>>;
    for (const item of this) {
        const k = key(item);
        const collection = result[k];
        if (!collection)
            result[k] = [item];
        else
            collection.push(item);
    }
    return result;
};

Array.repeat = function<T> (x : T, n : number) : Array<T> {
    return new Array<T>(n).fill(x);
};

Array.repeat = function<T> (fn : (i : number) => T, n : number) : Array<T> {
    return new Array<T>(n).map((_value, i) => fn(i));
};

export {};
