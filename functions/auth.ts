import jwt from "@tsndr/cloudflare-worker-jwt";
import { AuthType, User, UserDetailed } from "../common/models/user";
import { Env, NotAuthenticated, PromisedResult, failure, getUnixTime, internalError, ok, success } from "./utils";
import { dbGetByProperties, dbInsert } from "./db";

export interface AuthUser {
    name : string;
    email : string;
    avatar : string;
}

export const getToken = async (user : User, secret : string) : Promise<string> => jwt.sign(user, secret, { algorithm: "HS256" });

export const validateToken = async (token : string, secret : string) : Promise<boolean> => jwt.verify(token, secret, { algorithm: "HS256" });

export const getSignOutResponse = (env : Env) : Response => ok("ok", { "Set-Cookie": `jwtToken=deleted; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=.${env.DEVELOPMENT ? "localhost" : "greyboard.app"}; path=/; SameSite=None; secure; httpOnly` });

export const getSignedInUser = async (request : Request, secret : string) : PromisedResult<User> => {
    const token = request.headers.get("Cookie")?.match(/jwtToken=([^;]+)/);
    if (!token || !token[1] || !(await validateToken(token[1], secret)))
        return failure(new NotAuthenticated());

    return success(jwt.decode(token[1]).payload as User);
};

export const signIn = async (env : Env, authType : AuthType, userInfoGetter : () => PromisedResult<AuthUser>, secret : string) : Promise<Response> => {
    const userInfo = await userInfoGetter();
    if ("error" in userInfo)
        return internalError(userInfo.error);

    let user : User | undefined;
    const entry = await dbGetByProperties<UserDetailed>(env.db, "users", [["email", userInfo.value.email], ["type", authType]]);
    if ("error" in entry)
        return internalError(entry.error);

    if (entry.value.length === 0) {
        const inserted = await dbInsert<UserDetailed>(env.db, "users", { ...userInfo.value, type: authType, createdAt: getUnixTime() });
        if ("error" in inserted)
            return internalError(inserted.error);
        user = inserted.value;
    } else {
        [user] = entry.value;
    }

    const token = await getToken(user, secret);

    const now = new Date();
    now.setTime(now.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
    return ok<User>(user, {
        "Set-Cookie": `jwtToken=${token}; expires=${now.toUTCString()}; domain=.${env.DEVELOPMENT ? "localhost" : "greyboard.app"}; path=/; SameSite=None; secure; httpOnly;`,
    });
};
