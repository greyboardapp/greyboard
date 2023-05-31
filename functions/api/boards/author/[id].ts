import { UUIDSchema } from "../../../../common/models/uuid";
import { getSignedInUser } from "../../../auth";
import { accessQuery } from "../../../queries/access";
import { boardQuery } from "../../../queries/board";
import { BoardNotFound, Env, ValidationError, badRequest, notFound, ok } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ request, params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const boards = await boardQuery(env.db, { "boards.author": id.data });
    if ("error" in boards)
        return notFound(new BoardNotFound("User does not have any boards"));

    const accesses = await accessQuery(env.db, { "access.user": id.data });
    if ("error" in accesses) {
        console.error("Failed to get accesses for user");
    } else if (accesses.value.length > 0) {
        const sharedBoards = await boardQuery(env.db, { "boards.id": accesses.value.map((access) => access.board) });
        if ("error" in sharedBoards)
            console.error("Unable to get shared boards for user");
        else
            boards.value.push(...sharedBoards.value);
    }

    boards.value.sort((a, b) => b.modifiedAt - a.modifiedAt);

    const user = await getSignedInUser(request, env.JWT_SECRET);

    if ("error" in user || user.value.id !== id.data)
        return ok(boards.value.filter((b) => b.isPublic && !b.isDeleted));
    return ok(boards.value.filter((b) => !b.isDeleted));
};
