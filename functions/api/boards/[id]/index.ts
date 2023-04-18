import { Board } from "../../../../common/models/board";
import { UUIDSchema } from "../../../../common/models/uuid";
import { BoardNotFound, Env, ValidationError, badRequest, dbGetById, notFound, ok } from "../../../utils";

export const onRequestGet : PagesFunction<Env> = async ({ params, env }) => {
    const id = UUIDSchema.safeParse(params.id);
    if (!id.success)
        return badRequest(new ValidationError(id.error.message));

    const board = await dbGetById<Board>(env.db, "boards", id.data);
    if ("error" in board)
        return notFound(new BoardNotFound("Board not found"));

    return ok(board);
};
