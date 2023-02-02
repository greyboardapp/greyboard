import { Board, BoardCreation, BoardCreationSchema, BoardData, BoardSaveData } from "../models/board";
import { user } from "../utils/system/auth";
import { ApiResponse } from "./api";

export async function getUserBoards() : Promise<ApiResponse<Board[]>> {
    try {
        const loggedInUser = user();
        if (!loggedInUser)
            return { status: 403, error: "errors.notLoggedIn" };
        return (await (await fetch(`${import.meta.env.BACKEND_URL}/api/boards/author/${loggedInUser.id}`, { credentials: "include" })).json()) as ApiResponse<Board[]>;
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function getBoardData(slug : string) : Promise<ApiResponse<BoardData>> {
    try {
        const board = (await (await fetch(`${import.meta.env.BACKEND_URL}/api/boards/slug/${slug}`, { credentials: "include" })).json()) as ApiResponse<Board>;
        if (board.status !== 200 || board.error || !board.result)
            return { status: board.status, error: board.error };

        const loggedInUser = user();

        if (!board.result.isPublic && (!loggedInUser || board.result.author !== loggedInUser.id))
            return { status: 403, error: "errors.unauthorized" };

        const contentResult = await fetch(`${import.meta.env.BACKEND_URL}/api/boards/${board.result.id}/contents`, { credentials: "include" });
        if (contentResult.status !== 200)
            return { status: 500, error: "errors.boardDoesNotHaveContents" };
        const contents = await contentResult.arrayBuffer() as Uint8Array;

        return {
            status: 200,
            result: {
                ...board.result,
                contents,
            },
        };
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function createBoard(data : BoardCreation) : Promise<ApiResponse<Board>> {
    try {
        const validated = BoardCreationSchema.safeParse(data);
        if (!validated.success)
            return { status: 400, error: validated.error.message };

        return (await (await fetch(`${import.meta.env.BACKEND_URL}/api/boards/`, {
            method: "POST",
            body: JSON.stringify(data),
            credentials: "include",
        })).json()) as ApiResponse<Board>;
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function saveBoard(data : BoardSaveData) : Promise<ApiResponse<null>> {
    try {
        console.log(data.contents);
        await fetch(`${import.meta.env.BACKEND_URL}/api/boards/${data.id}/contents`, {
            method: "PUT",
            body: data.contents,
            credentials: "include",
        });
        return { status: 200, result: null };
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}
