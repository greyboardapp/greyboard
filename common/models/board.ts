import { z } from "zod";
import { Entity } from "./entity";
import { UUIDSchema } from "./uuid";
import { User } from "./user";

export interface BoardSimple extends Entity {
    author : string;
    isPublic : boolean;
    isPermanent : boolean;
    isDeleted : boolean;
    accesses : BoardAccessSimple[];
}

export interface Board extends Entity {
    name : string;
    author : User;
    isPublic : boolean;
    isPermanent : boolean;
    isDeleted : boolean;
    slug : string;
    thumbnail : string;
    region : string;
    accesses : BoardAccess[];
    createdAt : number;
    modifiedAt : number;
}

export type BoardFlattened = Omit<Board, "author"> & { author : string }

export const BoardCreationSchema = z.object({
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sa-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9-_.]+$/, { message: "errors.boardNameInvalidCharacter" }).trim(),
});

export type BoardCreationData = z.infer<typeof BoardCreationSchema>;

export const BoardSlugSchema = z.string().trim().regex(/^[A-Za-z0-9]{8}$/);

export const BoardAccessTypes = ["texts.viewer", "texts.editor", "texts.admin"];

export enum BoardAccessType {
    Viewer,
    Editor,
    Admin
}

export interface BoardAccessSimple extends Entity {
    board : string;
    user : string;
    type : BoardAccessType;
}

export interface BoardAccess extends Entity {
    board : string;
    user : User;
    type : BoardAccessType;
}

export const BoardUpdateSchema = z.object({
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sa-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9-_.]+$/, { message: "errors.boardNameInvalidCharacter" }).trim()
        .optional(),
    isPublic: z.boolean().optional(),
    isPermanent: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    thumbnail: z.string().optional(),
    accesses: z.array(z.object({
        user: UUIDSchema,
        type: z.nativeEnum(BoardAccessType),
    })).optional(),
});

export type BoardUpdateData = z.infer<typeof BoardUpdateSchema>;

export const BoardsUpdateSchema = z.object({
    ids: z.array(UUIDSchema),
    properties: BoardUpdateSchema,
});

export type BoardsUpdateData = z.infer<typeof BoardsUpdateSchema>;
