import { Board, BoardCreationSchema, BoardDeleteSchema } from "../../../common/models/board";
import { getSignedInUser } from "../../auth";
import { BoardCreationFailed, BoardNotFound, Env, NotAuthenticated, ValidationError, badRequest, dbDeleteById, dbDeleteByIds, dbGetByProperty, dbInsert, getUnixTime, internalError, notFound, ok, randomString, unauthorized } from "../../utils";

export const onRequestPost : PagesFunction<Env> = async ({ request, env }) => {
    try {
        const body = BoardCreationSchema.safeParse(await request.json());
        if (!body.success)
            return badRequest(new ValidationError(body.error.message));

        const user = await getSignedInUser(request, env.JWT_SECRET);
        if ("error" in user)
            return unauthorized(new NotAuthenticated("User not authenticated"));

        const board = await dbInsert<Board>(env.db, "boards", {
            name: body.data.name,
            author: user.value.id,
            isPublic: false,
            isPermanent: false,
            slug: randomString(),
            createdAt: getUnixTime(),
            modifiedAt: getUnixTime(),
        });

        if ("error" in board)
            return internalError(new BoardCreationFailed("Unable to create board"));

        const result = await env.boards.put(board.value.id, new ArrayBuffer(0));

        if (!result) {
            dbDeleteById(env.db, "boards", board.value.id);
            return internalError(new BoardCreationFailed("Unable to create board"));
        }

        return ok(board.value);
    } catch (e) {
        console.error(e);
        return internalError(e);
    }
};

export const onRequestDelete : PagesFunction<Env> = async ({ request, env }) => {
    try {
        const body = BoardDeleteSchema.safeParse(await request.json());
        if (!body.success)
            return badRequest(new ValidationError(body.error.message));

        const user = await getSignedInUser(request, env.JWT_SECRET);
        if ("error" in user)
            return unauthorized(new NotAuthenticated("User not authenticated"));

        const boards = await dbGetByProperty<Board>(env.db, "boards", "author", user.value.id);
        if ("error" in boards)
            return notFound(new BoardNotFound("User does not have any boards"));

        const boardsToBeDeleted = boards.value.filter((board) => body.data.ids.includes(board.id)).map((board) => board.id);
        await dbDeleteByIds(env.db, "boards", boardsToBeDeleted);
        await env.boards.delete(boardsToBeDeleted);

        return ok(boardsToBeDeleted.length);
    } catch (e) {
        console.error(e);
        return internalError(e);
    }
};
