import { z } from "zod";

export interface Board {
    id : number;
    name : string;
    author : string;
    isPublic : boolean;
    isPermanent : boolean;
    slug : string;
    createdAt : number;
    modifiedAt : number;
}

export const BoardCreationSchema = z.object({
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sa-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9-_.]+$/, { message: "errors.boardNameInvalidCharacter" }).trim(),
});

export type BoardCreation = z.infer<typeof BoardCreationSchema>;

export interface BoardData extends Board {
    contents : Uint8Array;
}

export interface BoardSaveData {
    id : number;
    name : string;
    contents : Uint8Array;
}
