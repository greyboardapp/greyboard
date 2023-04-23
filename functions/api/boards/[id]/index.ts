import { Board, BoardUpdateSchema } from "../../../../common/models/board";
import { UUIDSchema } from "../../../../common/models/uuid";
import { getSignedInUser } from "../../../auth";
import { BoardNotFound, BoardUpdateFailed, Env, Unauthorized, ValidationError, badRequest, dbGetById, dbUpdateById, internalError, notFound, ok, unauthorized } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const board = await dbGetById<Board>(env.db, "boards", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("Board not found"));

    return ok(board);
};

export const onRequestPut : PagesFunction<Env> = async ({ request, params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const content = await request.json();
    if (!content)
        return badRequest(new ValidationError());

    const data = BoardUpdateSchema.safeParse(content);
    if (!data.success)
        return badRequest(new ValidationError(data.error.message));

    const board = await dbGetById<Board>(env.db, "boards", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("Board not found"));

    const user = await getSignedInUser(request, env.JWT_SECRET);
    if (("error" in user && board.value.isPublic) || (!("error" in user) && (board.value.author === user.value.id || board.value.isPublic))) {
        if (data.data.isPublic !== undefined && (("error" in user) || board.value.author !== user.value.id))
            return unauthorized(new Unauthorized());

        const update = await dbUpdateById(env.db, "boards", id.data, data.data);
        if ("error" in update)
            return internalError(new BoardUpdateFailed());

        return ok({});
    }

    return unauthorized(new Unauthorized());
};
