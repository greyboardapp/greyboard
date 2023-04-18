import { Board, BoardCreationSchema } from "../../../common/models/board";
import { getSignedInUser } from "../../auth";
import { BoardCreationFailed, Env, NotAuthenticated, ValidationError, badRequest, dbDeleteById, dbInsert, getUnixTime, internalError, ok, randomString, unauthorized } from "../../utils";

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
