import { Board } from "../../common/models/board";
import { dbQuery } from "../db";

export const boardQuery = dbQuery<Board>({
    table: "boards",
    primaryKey: "boards.id",
    join: {
        users: {
            on: "boards.author = users.id",
            inner: true,
        },
    },
    map: {
        id: "boards.id",
        name: "boards.name",
        author: {
            id: "users.id",
            name: "users.name",
            email: "users.email",
            avatar: "users.avatar",
        },
        isPublic: "boards.isPublic",
        isPermanent: "boards.isPermanent",
        isDeleted: "boards.isDeleted",
        slug: "boards.slug",
        thumbnail: "boards.thumbnail",
        region: "boards.region",
        accesses: undefined,
        createdAt: "boards.createdAt",
        modifiedAt: "boards.modifiedAt",
    },
});
