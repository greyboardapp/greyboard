// Disabled due to the client_id, client_secret and redirect_uri property names required by the github OAuth2 API
/* eslint-disable camelcase */
import { AuthType } from "../../../common/models/user";
import { signIn } from "../../auth";
import { ApiError, failure, success } from "../../utils";
import type { Env } from "../../utils";

interface GitHubAuthTokenResponse {
    error ?: string;
    error_description ?: string;
    access_token ?: string;
}

interface GitHubAuthUserResponse {
    email : string;
    name : string;
    login : string;
    avatar_url : string;
}

interface GitHubAuthEmailsResponse {
    email : string;
    primary : boolean;
}

interface GitHubAuthCallbackParams extends Record<string, string> {
    code : string;
    redirectUrl : string;
}

export const onRequestPost : PagesFunction<Env> = async ({ request, env }) => signIn(env.db, AuthType.GitHub, async () => {
    try {
        const body = await request.json<GitHubAuthCallbackParams>();

        const data = {
            client_id: env.AUTH_GITHUB_CLIENT_ID,
            client_secret: env.AUTH_GITHUB_CLIENT_SECRET,
            redirect_uri: body.redirectUrl,
            code: body.code,
        };

        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(data),
        });
        const token = await tokenResponse.json<GitHubAuthTokenResponse>();
        const accessToken = token.access_token;
        if (!accessToken) {
            console.error(token.error, token.error_description);
            return failure(new ApiError("Unable to get access token."));
        }

        const headers = {
            accept: "application/vnd.github.v3+json",
            authorization: `token ${accessToken}`,
            "user-agent": "greyboard-auth",
        };
        const userInfoResponse = await fetch("https://api.github.com/user", { headers });
        const userInfo = await userInfoResponse.json<GitHubAuthUserResponse>();

        if (!userInfo.email) {
            const emailResponse = await fetch("https://api.github.com/user/emails", { headers });
            const emails = await emailResponse.json<GitHubAuthEmailsResponse[]>();
            userInfo.email = (emails.find((email) => email.primary) ?? emails[0]).email;
        }

        return success({
            name: userInfo.name ?? userInfo.login,
            email: userInfo.email,
            avatar: userInfo.avatar_url,
        });
    } catch (e) {
        console.error(e);
        return failure(e);
    }
}, env.JWT_SECRET);
