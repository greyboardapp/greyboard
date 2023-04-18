import { Board } from "../../../../common/models/board";
import { UUIDSchema } from "../../../../common/models/uuid";
import { getSignedInUser } from "../../../auth";
import { BoardNotFound, Env, ValidationError, badRequest, dbGetByProperty, notFound, ok } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ request, params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const board = await dbGetByProperty<Board>(env.db, "boards", "author", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("User does not have any boards"));
    board.value.sort((a, b) => b.modifiedAt - a.modifiedAt);

    const user = await getSignedInUser(request, env.JWT_SECRET);

    if ("error" in user || user.value.id !== id.data)
        return ok(board.value.filter((b) => b.isPublic));
    return ok(board.value);
};
