import type { ApiResponse } from "../common/api";

export interface Services {
    db : D1Database;
    cache : KVNamespace;
    boards : R2Bucket;
}

export interface Env extends Services {
    DEVELOPMENT : string;
    JWT_SECRET : string;
    AUTH_GOOGLE_CLIENT_ID : string;
    AUTH_GOOGLE_CLIENT_SECRET : string;
    AUTH_GITHUB_CLIENT_ID : string;
    AUTH_GITHUB_CLIENT_SECRET : string;
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
export class BoardUpdateFailed extends RuntimeError {}
export class BoardModificationFailed extends RuntimeError {}
export class BoardNotFound extends RuntimeError {}
export class BoardContentsNotFound extends RuntimeError {}
export class UserNotFound extends RuntimeError {}

export type Result<T = undefined, E = Error | unknown> = { value : T } | { error : E };
export type PromisedResult<T = undefined, E = Error | unknown> = Promise<Result<T, E>>;

export type OmitRequired<T, K extends keyof T> = Partial<Omit<T, K>> & Partial<Pick<T, K>>;

export const success = <T, E = Error | unknown>(value : T) : Result<T, E> => ({ value });
export const failure = <T, E = Error | unknown>(error : E) : Result<T, E> => ({ error });
