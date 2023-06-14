import { User } from "../../../common/models/user";
import { dbGetByProperty } from "../../db";
import { Env, UserNotFound, ValidationError, badRequest, notFound, ok } from "../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ params, env }) => {
    if (!params.email || typeof params.email !== "string")
        return badRequest(new ValidationError("email invalid"));

    const users = await dbGetByProperty<User>(env.db, "users", "email", params.email);
    if ("error" in users)
        return notFound(new UserNotFound());

    return ok(users.value[0]);
};
