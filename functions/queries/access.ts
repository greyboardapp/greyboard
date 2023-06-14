import { BoardAccess } from "../../common/models/board";

import { dbQuery } from "../db";

export const accessQuery = dbQuery<BoardAccess>({
    table: "access",
    primaryKey: "access.id",
    join: {
        users: {
            on: "access.user = users.id",
            inner: true,
        },
    },
    map: {
        id: "access.id",
        board: "access.board",
        type: "access.type",
        user: {
            id: "users.id",
            name: "users.name",
            email: "users.email",
            avatar: "users.avatar",
        },
    },
});
