import { Entity } from "../common/models/entity";
import { OmitRequired, PromisedResult, failure, success } from "./utils";

function assign<T>(obj : Record<string, unknown>, key : string, value : T) : Record<string, unknown> {
    const parts = key.split(".");
    let result = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (result[parts[i]] === undefined)
            result[parts[i]] = {};
        result = result[parts[i]] as Record<string, unknown>;
    }
    result[parts[parts.length - 1]] = value;
    return obj;
}

type DbQueryMapping<T> = {
    [K in keyof T] : string | DbQueryMapping<T[K]> | undefined;
}

interface DbJoinOptions {
    on : string;
    inner ?: true;
}

interface DbQueryOptions<T> {
    table : string;
    primaryKey : string;
    join ?: Record<string, DbJoinOptions>;
    map : DbQueryMapping<T>;
}

function getMappingKeys<T>(mapping : DbQueryMapping<T>, path = "") : string[] {
    return Object.entries(mapping).flatMap(([key, value]) => {
        if (value === undefined)
            return [];
        if (typeof value === "object")
            return getMappingKeys(value ?? {}, `${path}${key}.`);
        return `${value} as '${path}${key}'`;
    });
}

const toDbParameter = <T>(value : T) : number | string | bigint | null => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "bigint")
        return value;
    if (typeof value === "boolean")
        return value ? 1 : 0;
    return null;
};

const toDbParameters = <T extends {}>(item : T) : (number | string | bigint | null)[] => Object.values(item).map((v) => toDbParameter(v));

const fromDbRecord = <T extends Entity>(record : T) : T => {
    const result : T = {} as T;
    for (const [key, value] of Object.entries(record) as [keyof T, T[keyof T]][])
        if (String(key).startsWith("is"))
            result[key] = (value === 1) as T[keyof T];
        else
            result[key] = value;
    return result;
};

export function mapDbRecord<T, U>(record : T) : U {
    const result : Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record as object))
        assign(result, key, (String(key).startsWith("is")) ? (value === 1) as T[keyof T] : value);
    return result as U;
}

export function dbQuery<T>(options : DbQueryOptions<T>) : (db : D1Database, where ?: Record<string, string | number | boolean | (string | number | boolean)[]>, conditions ?: string[]) => PromisedResult<T[]> {
    return async (db : D1Database, where ?: Record<string, string | number | boolean | (string | number | boolean)[]>, conditions ?: string[]) : PromisedResult<T[]> => {
        let query = `SELECT ${getMappingKeys(options.map).join(",")} FROM ${options.table}`;
        if (options.join)
            for (const [key, value] of Object.entries(options.join))
                query += `${value.inner ? "" : " LEFT"} JOIN ${key} ON ${value.on}`;
        const cond : string[] = [];
        const bindings : (string | number | boolean)[] = [];
        if (where) {
            let index = 1;
            for (const [key, value] of Object.entries(where))
                if (Array.isArray(value)) {
                    const b : string[] = [];
                    for (let i = 0; i < value.length; i++)
                        b.push(`?${i + index}`);
                    cond.push(`${key} IN (${b.join(",")})`);
                    bindings.push(...value);
                    index += value.length;
                } else {
                    cond.push(`${key}=?${index}`);
                    bindings.push(value);
                }
        }
        if (conditions)
            cond.push(...conditions);
        if (cond.length > 0)
            query += ` WHERE ${cond.join(" AND ")}`;
        const result = await db.prepare(query).bind(...bindings).all();
        if (result.error)
            return failure(result.error);
        if (!result.results)
            return failure("");
        return success(result.results.map((v) => mapDbRecord<unknown, T>(v)));
    };
}

export const dbInsert = async <T extends Entity>(db : D1Database, table : string, item : OmitRequired<T, "id">) : PromisedResult<T> => {
    try {
        item.id = item.id ?? crypto.randomUUID();

        const query = `INSERT INTO ${table} (${Object.keys(item).join(",")}) VALUES (${Object.keys(item).map((p, i) => `?${i + 1}`).join(",")})`;
        const result = await db.prepare(query).bind(...toDbParameters(item)).run();
        if (result.error)
            return failure(result.error);
        return success(item as T);
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbInsertMultiple = async <T extends Entity>(db : D1Database, table : string, items : OmitRequired<T, "id">[]) : PromisedResult<T[]> => {
    try {
        const values : string[] = [];
        const keysPerItem = Object.keys(items[0]).length + 1;

        for (const item of items) {
            item.id = item.id ?? crypto.randomUUID();
            values.push(`(${Object.keys(item).map((p, i) => `?${values.length * keysPerItem + i + 1}`).join(",")})`);
        }

        const query = `INSERT INTO ${table} (${Object.keys(items[0]).join(",")}) VALUES ${values.join(",")}`;
        const result = await db.prepare(query).bind(...items.flatMap((item) => toDbParameters(item))).run();
        if (result.error)
            return failure(result.error);
        return success(items as T[]);
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbGetById = async <T extends Entity>(db : D1Database, table : string, id : string) : PromisedResult<T> => {
    try {
        const query = `SELECT * FROM ${table} WHERE id = ?`;
        const result = await db.prepare(query).bind(id).first<T>();
        if (!result)
            return failure("db error");
        return success(fromDbRecord(result));
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbGetByProperty = async <T extends Entity>(db : D1Database, table : string, key : keyof T, value : string | number | boolean) : PromisedResult<T[]> => {
    try {
        const query = `SELECT * FROM ${table} WHERE ${String(key)} = ?`;
        const result = await db.prepare(query).bind(toDbParameter(value)).all<T>();
        if (result.error)
            return failure(result.error);
        if (!result.results)
            return failure("");
        return success(result.results.map((v) => fromDbRecord(v)));
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbGetByProperties = async <T extends Entity>(db : D1Database, table : string, props : [keyof T, string | number | boolean][]) : PromisedResult<T[]> => {
    try {
        const query = `SELECT * FROM ${table} WHERE ${props.map(([key, value], i) => `${String(key)} = ?${i + 1}`).join(" AND ")}`;
        const result = await db.prepare(query).bind(...props.map(([key, value]) => toDbParameter(value))).all<T>();
        if (result.error)
            return failure(result.error);
        if (!result.results)
            return failure("");
        return success(result.results.map((v) => fromDbRecord(v)));
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbUpdateById = async <T extends Entity>(db : D1Database, table : string, id : string, item : OmitRequired<T, "id">) : PromisedResult => {
    try {
        const query = `UPDATE ${table} SET ${Object.keys(item).map((key, i) => `${key}=?${i + 2}`).join(", ")} WHERE id = ?1`;
        const result = await db.prepare(query).bind(id, ...toDbParameters(item)).run();
        if (result.error)
            return failure(result.error);
        return success(undefined);
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbUpdateByIds = async <T extends Entity>(db : D1Database, table : string, ids : string[], item : OmitRequired<T, "id">) : PromisedResult => {
    try {
        const query = `UPDATE ${table} SET ${Object.keys(item).map((key, i) => `${key}=?${i + 1 + ids.length}`).join(", ")} WHERE id IN (${ids.map((id, i) => `?${i + 1}`)})`;
        const result = await db.prepare(query).bind(...ids, ...toDbParameters(item)).run();
        if (result.error)
            return failure(result.error);
        return success(undefined);
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbDeleteById = async (db : D1Database, table : string, id : string) : PromisedResult => {
    try {
        const query = `DELETE FROM ${table} WHERE id = ?`;
        const result = await db.prepare(query).bind(id).run();
        if (result.error)
            return failure(result.error);
        return success(undefined);
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbDeleteByIds = async (db : D1Database, table : string, ids : string[]) : PromisedResult => {
    try {
        const query = `DELETE FROM ${table} WHERE id IN (${ids.map((id, i) => `?${i + 1}`)})`;
        const result = await db.prepare(query).bind(...ids).run();
        if (result.error)
            return failure(result.error);
        return success(undefined);
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};

export const dbDeleteByProperty = async <T extends Entity>(db : D1Database, table : string, key : keyof T, value : string | number | boolean) : PromisedResult<T[]> => {
    try {
        const query = `DELETE FROM ${table} WHERE ${String(key)} = ?`;
        const result = await db.prepare(query).bind(toDbParameter(value)).all<T>();
        if (result.error)
            return failure(result.error);
        if (!result.results)
            return failure("");
        return success(result.results.map((v) => fromDbRecord(v)));
    } catch (e) {
        console.error(e);
        return failure(e);
    }
};
