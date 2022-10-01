/* eslint-disable func-names */
declare global {
    interface Map<K, V> {
        toObject<KK extends string | number | symbol, VV>(key : (x : [K, V]) => KK, value : (x : [K, V]) => VV) : Record<KK, VV>;
    }
}

Map.prototype.toObject = function<K, V, KK extends string | number | symbol, VV> (this : Map<K, V>, key : (x : [K, V]) => KK, value : (x : [K, V]) => VV) : Record<KK, VV> {
    const result : Record<KK, VV> = {} as Record<KK, VV>;
    for (const item of this) {
        const k = key(item);
        result[k] = value(item);
    }
    return result;
};

export {};
