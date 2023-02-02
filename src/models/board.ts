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
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sA-Za-z0-9-_.]+$/).trim(),
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
