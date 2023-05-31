import { Board, BoardAccessSimple, BoardAccessType, BoardSimple } from "../../../../common/models/board";
import { UUIDSchema } from "../../../../common/models/uuid";
import { getSignedInUser } from "../../../auth";
import { dbGetById, dbGetByProperty, dbUpdateById } from "../../../db";
import { ok, internalError, BoardContentsNotFound, BoardNotFound, Env, Unauthorized, ValidationError, badRequest, buffer, notFound, unauthorized, BoardModificationFailed, getUnixTime } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ request, params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const board = await dbGetById<BoardSimple>(env.db, "boards", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("Board not found"));
    const accesses = await dbGetByProperty<BoardAccessSimple>(env.db, "access", "board", board.value.id);
    board.value.accesses = ("error" in accesses) ? [] : accesses.value;

    const user = await getSignedInUser(request, env.JWT_SECRET);

    if (("error" in user && board.value.isPublic) || (!("error" in user) && (board.value.author === user.value.id || board.value.accesses.some((a) => a.user === user.value.id) || board.value.isPublic))) {
        const contents = await env.boards.get(board.value.id);
        if (!contents)
            return notFound(new BoardContentsNotFound("Board contents not found"));

        const data = contents.body ? (await contents.arrayBuffer()) : new Uint8Array();
        return buffer(data);
    }

    return unauthorized(new Unauthorized("Forbidden board"));
};

export const onRequestPut : PagesFunction<Env> = async ({ request, params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const board = await dbGetById<BoardSimple>(env.db, "boards", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("Board not found"));
    const accesses = await dbGetByProperty<BoardAccessSimple>(env.db, "access", "board", board.value.id);
    board.value.accesses = ("error" in accesses) ? [] : accesses.value;

    const user = await getSignedInUser(request, env.JWT_SECRET);

    if (("error" in user && board.value.isPublic) || (!("error" in user) && (board.value.author === user.value.id || board.value.accesses.some((a) => a.type >= BoardAccessType.Editor && a.user === user.value.id) || board.value.isPublic))) {
        const content = await request.arrayBuffer();
        if (!content)
            return badRequest(new ValidationError());

        const result = await env.boards.put(id.data, content);

        if (!result)
            return internalError(new BoardModificationFailed("Unable to modify board"));

        await dbUpdateById<Board>(env.db, "boards", id.data, { modifiedAt: getUnixTime() });

        return ok(result.uploaded);
    }

    return unauthorized(new Unauthorized("Forbidden board"));
};
