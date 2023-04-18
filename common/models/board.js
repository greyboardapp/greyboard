import { z } from "zod";
export const BoardCreationSchema = z.object({
    name: z.string().max(32, { message: "errors.boardNameMaxLength" }).regex(/^[\sa-zA-Z\u00C0-\u024F\u1E00-\u1EFF0-9-_.]+$/).trim(),
});
export const BoardSlugSchema = z.string().trim().regex(/^[A-Za-z0-9]{8}$/);
