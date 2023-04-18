import { Board, BoardSlugSchema } from "../../../../common/models/board";
import { getSignedInUser } from "../../../auth";
import { BoardNotFound, Env, Unauthorized, ValidationError, badRequest, dbGetByProperty, notFound, ok, unauthorized } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ request, params, env }) => {
    const slug = BoardSlugSchema.safeParse(params.slug);
    if (!slug.success)
        return badRequest(new ValidationError());

    const board = await dbGetByProperty<Board>(env.db, "boards", "slug", slug.data);
    if ("error" in board || board.value.length !== 1)
        return notFound(new BoardNotFound("Board not found"));

    const user = await getSignedInUser(request, env.JWT_SECRET);

    if (("error" in user && board.value[0].isPublic) || (!("error" in user) && (board.value[0].author === user.value.id || board.value[0].isPublic)))
        return ok(board.value[0]);

    return unauthorized(new Unauthorized("Forbidden board"));
};
