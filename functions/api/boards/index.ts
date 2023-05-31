import { Board, BoardCreationSchema, BoardFlattened, BoardsUpdateSchema } from "../../../common/models/board";
import { getSignedInUser } from "../../auth";
import { dbDeleteById, dbGetByProperty, dbInsert, dbUpdateByIds } from "../../db";
import { BoardCreationFailed, BoardNotFound, Env, NotAuthenticated, ValidationError, badRequest, getUnixTime, internalError, notFound, ok, randomString, unauthorized } from "../../utils";

export const onRequestPost : PagesFunction<Env> = async ({ request, env }) => {
    try {
        const body = BoardCreationSchema.safeParse(await request.json());
        if (!body.success)
            return badRequest(new ValidationError(body.error.message));

        const user = await getSignedInUser(request, env.JWT_SECRET);
        if ("error" in user)
            return unauthorized(new NotAuthenticated("User not authenticated"));

        const board = await dbInsert<BoardFlattened>(env.db, "boards", {
            name: body.data.name,
            author: user.value.id,
            isPublic: false,
            isPermanent: false,
            // Disabled due to issues with DOM and ESNext type conflicts in typescript-eslint.
            // The @cloudflare/workers-types defines a Request type, but typescript overrides it the native fetch API Request from the DOM lib
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            region: (request.cf?.continent ?? "eu").toLocaleLowerCase(),
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

export const onRequestPut : PagesFunction<Env> = async ({ request, env }) => {
    try {
        const body = BoardsUpdateSchema.safeParse(await request.json());
        if (!body.success)
            return badRequest(new ValidationError(body.error.message));

        const user = await getSignedInUser(request, env.JWT_SECRET);
        if ("error" in user)
            return unauthorized(new NotAuthenticated("User not authenticated"));

        const boards = await dbGetByProperty<Board>(env.db, "boards", "author", user.value.id);
        if ("error" in boards)
            return notFound(new BoardNotFound("User does not have any boards"));

        const boardsToBeUpdated = boards.value.filter((board) => body.data.ids.includes(board.id)).map((board) => board.id);
        await dbUpdateByIds(env.db, "boards", boardsToBeUpdated, body.data.properties);
        return ok(boardsToBeUpdated.length);
    } catch (e) {
        console.error(e);
        return internalError(e);
    }
};
