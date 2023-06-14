import { BoardAccessSimple, BoardAccessType, BoardSimple, BoardUpdateSchema } from "../../../../common/models/board";
import { UUIDSchema } from "../../../../common/models/uuid";
import { getSignedInUser } from "../../../auth";
import { dbDeleteByIds, dbGetById, dbGetByProperty, dbInsertMultiple, dbUpdateById } from "../../../db";
import { boardQuery } from "../../../queries/board";
import { ApiError, BoardNotFound, BoardUpdateFailed, Env, Unauthorized, ValidationError, badRequest, internalError, notFound, ok, unauthorized } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const boards = await boardQuery(env.db, { "boards.ids": id.data });
    if ("error" in boards)
        return notFound(new BoardNotFound("Board not found"));

    return ok(boards.value[0]);
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

    const board = await dbGetById<BoardSimple>(env.db, "boards", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("Board not found"));

    const accesses = await dbGetByProperty<BoardAccessSimple>(env.db, "access", "board", board.value.id);
    board.value.accesses = ("error" in accesses) ? [] : accesses.value;

    const user = await getSignedInUser(request, env.JWT_SECRET);
    if (("error" in user && board.value.isPublic) || (!("error" in user) && (board.value.author === user.value.id || board.value.accesses.some((a) => a.type >= BoardAccessType.Editor && a.user === user.value.id) || board.value.isPublic))) {
        if ((data.data.isPublic !== undefined || data.data.accesses !== undefined) && ("error" in user || (board.value.author !== user.value.id && !board.value.accesses.some((a) => a.type === BoardAccessType.Admin && a.user === user.value.id))))
            return unauthorized(new Unauthorized());

        if (data.data.accesses !== undefined) {
            await dbDeleteByIds(env.db, "access", board.value.accesses.map((a) => a.id));

            if (data.data.accesses.length > 0) {
                const result = await dbInsertMultiple<BoardAccessSimple>(env.db, "access", data.data.accesses.map((access) => ({ ...access, board: board.value.id })));
                if ("error" in result)
                    return internalError(new ApiError("Database write failed"));
            }
        }

        const { accesses: temp, ...updateData } = data.data;
        const update = await dbUpdateById(env.db, "boards", id.data, updateData);
        if ("error" in update)
            return internalError(new BoardUpdateFailed());

        return ok({});
    }

    return unauthorized(new Unauthorized());
};
