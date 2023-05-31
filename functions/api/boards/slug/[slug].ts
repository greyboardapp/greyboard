import { BoardSlugSchema } from "../../../../common/models/board";
import { getSignedInUser } from "../../../auth";
import { accessQuery } from "../../../queries/access";
import { boardQuery } from "../../../queries/board";
import { BoardNotFound, Env, Unauthorized, ValidationError, badRequest, notFound, ok, unauthorized } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ request, params, env }) => {
    const slug = BoardSlugSchema.safeParse(params.slug);
    if (!slug.success)
        return badRequest(new ValidationError());

    const board = await boardQuery(env.db, { "boards.slug": slug.data });
    if ("error" in board || board.value.length !== 1)
        return notFound(new BoardNotFound("Board not found"));

    const user = await getSignedInUser(request, env.JWT_SECRET);

    const accesses = await accessQuery(env.db, { "access.board": board.value[0].id });
    board.value[0].accesses = ("error" in accesses) ? [] : accesses.value;

    if (("error" in user && board.value[0].isPublic) || (!("error" in user) && (board.value[0].author.id === user.value.id || board.value[0].accesses.some((a) => a.user.id === user.value.id) || board.value[0].isPublic)))
        return ok(board.value[0]);

    return unauthorized(new Unauthorized("Forbidden board"));
};
