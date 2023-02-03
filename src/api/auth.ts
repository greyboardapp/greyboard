// Disabled due to the client_id, redirect_uri, response_type and include_granted_scopes property names required by the google OAuth2 API
// Disabled due to the client_id, client_secret and redirect_uri property names required by the github OAuth2 API
/* eslint-disable camelcase */
import { User } from "../core/data/user";
import { queryString } from "../utils/system/misc";
import { ApiResponse } from "./api";

export function getGoogleAuthCallbackUrl() : string {
    return `${window.location.hostname === "localhost" ? "https://localhost.greyboard.workers.dev" : window.location.origin}/auth/google`;
}

export function getGoogleAuthUrl() : string {
    return `https://accounts.google.com/o/oauth2/v2/auth?${queryString({
        client_id: import.meta.env.GOOGLE_AUTH_CLIENT_ID,
        redirect_uri: getGoogleAuthCallbackUrl(),
        response_type: "code",
        scope: "openid email profile",
        include_granted_scopes: "true",
        state: "pass-through value",
    })}`;
}

export async function handleGoogleAuthCallback(code : string) : Promise<ApiResponse<User>> {
    try {
        return (await (await fetch(`${import.meta.env.BACKEND_URL}/api/auth/google`, {
            method: "POST",
            body: JSON.stringify({
                code,
                redirectUrl: getGoogleAuthCallbackUrl(),
            }),
            credentials: "include",
        })).json()) as ApiResponse<User>;
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export function getGithubAuthCallbackUrl() : string {
    return `${window.location.hostname === "localhost" ? "https://localhost.greyboard.workers.dev" : window.location.origin}/auth/github`;
}

export function getGithubAuthUrl() : string {
    return `https://github.com/login/oauth/authorize?${queryString({
        client_id: import.meta.env.GITHUB_AUTH_CLIENT_ID,
        redirect_uri: getGithubAuthCallbackUrl(),
        scope: "read:user read:email",
        allow_signup: true,
    })}`;
}

export async function handleGithubAuthCallback(code : string) : Promise<ApiResponse<User>> {
    try {
        return (await (await fetch(`${import.meta.env.BACKEND_URL}/api/auth/github`, {
            method: "POST",
            body: JSON.stringify({
                code,
                redirectUrl: getGithubAuthCallbackUrl(),
            }),
            credentials: "include",
        })).json()) as ApiResponse<User>;
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function logout() : Promise<ApiResponse<boolean>> {
    try {
        return (await (await fetch(`${import.meta.env.BACKEND_URL}/api/auth/logout`, { credentials: "include" })).json()) as ApiResponse<boolean>;
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}
