import type { ApiResponse } from "../common/api";
import type { Entity } from "../common/models/entity";

export interface Services {
    db : D1Database;
    cache : KVNamespace;
    boards : R2Bucket;
}

export interface Env extends Services {
    DEVELOPMENT : boolean;
    JWT_SECRET : string;
    GOOGLE_AUTH_CLIENT_ID : string;
    GOOGLE_AUTH_CLIENT_SECRET : string;
    GITHUB_AUTH_CLIENT_ID : string;
    GITHUB_AUTH_CLIENT_SECRET : string;
}

export const pass = () : void => {};

export function getUnixTime() : number {
    return Math.floor(Date.now() / 1000);
}

export function randomString(length = 8) : string {
    const buffer = crypto.getRandomValues(new Uint8Array(length));
    const b64 = btoa(buffer.toString());
    return b64.substring(0, length);
}

export const json = <T>(data : T, status = 200, headers ?: Record<string, string>) : Response => new Response(JSON.stringify(data), {
    status,
    headers: {
        "Content-Type": "application/json",
        ...headers,
    },
});

export const queryString = (obj : {[key : string] : unknown}) : string => Object.entries(obj).map(([key, value]) => `${key}=${value}`).join("&");

export const errorString = (error : unknown) : string => ((error instanceof Error) ? `${error.name}: ${error.message}` : (error as string));

export const buffer = (result : ArrayBuffer) : Response => new Response(result, { status: 200 });
export const ok = <T>(result : T | undefined, headers ?: Record<string, string>) : Response => json<ApiResponse<T>>({ status: 200, result }, 200, headers);
export const badRequest = (error : unknown) : Response => json<ApiResponse<undefined>>({ status: 400, error: errorString(error) }, 400);
export const unauthorized = (error : unknown) : Response => json<ApiResponse<undefined>>({ status: 401, error: errorString(error) }, 401);
export const notFound = (error : unknown) : Response => json<ApiResponse<undefined>>({ status: 404, error: errorString(error) }, 404);
export const internalError = (error : unknown) : Response => json<ApiResponse<undefined>>({ status: 500, error: errorString(error) }, 500);
export const redirect = (url : string, headers ?: Record<string, string>) : Response => new Response(null, {
    status: 302,
    headers: {
        location: url,
        ...headers,
    },
});

export class RuntimeError extends Error {
    constructor(message ?: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ApiError extends RuntimeError {}
export class InvalidCredentialsError extends RuntimeError {}
export class RecordNotFound extends RuntimeError {}
export class Unauthorized extends RuntimeError {}
export class AuthenticationFailed extends RuntimeError {}
export class NotAuthenticated extends RuntimeError {}
export class ValidationError extends RuntimeError {}
export class BoardCreationFailed extends RuntimeError {}
export class BoardModificationFailed extends RuntimeError {}
export class BoardNotFound extends RuntimeError {}
export class BoardContentsNotFound extends RuntimeError {}

export type Result<T = undefined, E = Error | unknown> = { value : T } | { error : E };
export type PromisedResult<T = undefined, E = Error | unknown> = Promise<Result<T, E>>;

export type OmitRequired<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export const success = <T, E = Error | unknown>(value : T) : Result<T, E> => ({ value });
export const failure = <T, E = Error | unknown>(error : E) : Result<T, E> => ({ error });

export const toDbParameter = <T>(value : T) : number | string | bigint | null => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "bigint")
        return value;
    if (typeof value === "boolean")
        return value ? 1 : 0;
    return null;
};

export const toDbParameters = <T extends {}>(item : T) : (number | string | bigint | null)[] => Object.values(item).map((v) => toDbParameter(v));

export const fromDbRecord = <T extends Entity>(record : T) : T => {
    const result : T = {} as T;
    for (const [key, value] of Object.entries(record) as [keyof T, T[keyof T]][])
        if (String(key).startsWith("is"))
            result[key] = (value === 1) as T[keyof T];
        else
            result[key] = value;
    return result;
};

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
