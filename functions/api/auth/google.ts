// Disabled due to the client_id, redirect_uri, response_type and include_granted_scopes property names required by the google OAuth2 API
/* eslint-disable camelcase */

import { signIn } from "../../auth";
import { AuthType } from "../../../common/models/user";
import { ApiError, Env, InvalidCredentialsError, failure, success } from "../../utils";

interface GoogleAuthTokenResponse {
    access_token ?: string;
}

interface GoogleAuthUserResponse {
    email : string;
    verified_email : boolean;
    name : string;
    given_name : string;
    picture : string;
}

interface GoogleAuthCallbackParams extends Record<string, string> {
    code : string;
    redirectUrl : string;
}

export const onRequestPost : PagesFunction<Env> = async ({ request, env }) => signIn(env.db, AuthType.Google, async () => {
    try {
        const body = await request.json<GoogleAuthCallbackParams>();

        const data = {
            client_id: env.AUTH_GOOGLE_CLIENT_ID,
            client_secret: env.AUTH_GOOGLE_CLIENT_SECRET,
            redirect_uri: body.redirectUrl,
            code: body.code,
            grant_type: "authorization_code",
        };

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify(data),
        });
        const token = await tokenResponse.json<GoogleAuthTokenResponse>();
        const accessToken = token.access_token;
        if (!accessToken)
            return failure(new ApiError("Unable to get access token."));

        const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
                headers: {
                    authorization: `Bearer ${accessToken}`,
                },
            },
        );
        const userInfo = await userInfoResponse.json<GoogleAuthUserResponse>();

        if (!userInfo.verified_email)
            return failure(new InvalidCredentialsError("User email not verified."));

        return success({
            name: userInfo.name,
            email: userInfo.email,
            avatar: userInfo.picture,
        });
    } catch (e) {
        console.error(e);
        return failure(e);
    }
}, env.JWT_SECRET);
