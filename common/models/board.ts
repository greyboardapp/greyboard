import { z } from "zod";
import { Entity } from "./entity";
import { UUIDSchema } from "./uuid";

export interface Board extends Entity {
    name : string;
    author : string;
    isPublic : boolean;
    isPermanent : boolean;
    isDeleted : boolean;
    slug : string;
    thumbnail : string;
    createdAt : number;
    modifiedAt : number;
}

export const BoardCreationSchema = z.object({
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sa-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9-_.]+$/, { message: "errors.boardNameInvalidCharacter" }).trim(),
});

export type BoardCreationData = z.infer<typeof BoardCreationSchema>;

export const BoardSlugSchema = z.string().trim().regex(/^[A-Za-z0-9]{8}$/);

export const BoardUpdateSchema = z.object({
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sa-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9-_.]+$/, { message: "errors.boardNameInvalidCharacter" }).trim()
        .optional(),
    isPublic: z.boolean().optional(),
    isPermanent: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    thumbnail: z.string().optional(),
});

export type BoardUpdateData = z.infer<typeof BoardUpdateSchema>;

export const BoardsUpdateSchema = z.object({
    ids: z.array(UUIDSchema),
    properties: BoardUpdateSchema,
});

export type BoardsUpdateData = z.infer<typeof BoardsUpdateSchema>;