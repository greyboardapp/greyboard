import { Board, BoardCreationData, BoardCreationSchema, BoardUpdateData, BoardsUpdateData } from "../../common/models/board";
import { BoardData } from "../models/board";
import { user } from "../utils/system/auth";
import { ApiResponse } from "./api";

export async function getUserBoards() : Promise<ApiResponse<Board[]>> {
    try {
        const loggedInUser = user();
        if (!loggedInUser)
            return { status: 403, error: "errors.notLoggedIn" };
        return (await (await fetch(`/api/boards/author/${loggedInUser.id}`, { credentials: "include" })).json());
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function getBoardData(slug : string) : Promise<ApiResponse<BoardData>> {
    try {
        const board : ApiResponse<Board> = (await (await fetch(`/api/boards/slug/${slug}`, { credentials: "include" })).json());
        if (board.status !== 200 || board.error || !board.result)
            return { status: board.status, error: board.error };

        const contentResult = await fetch(`/api/boards/${board.result.id}/contents`, { credentials: "include" });
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

export async function getBoardContents(id : string) : Promise<ApiResponse<Uint8Array>> {
    try {
        const contentResult = await fetch(`/api/boards/${id}/contents`, { credentials: "include" });
        if (contentResult.status !== 200)
            return { status: 500, error: "errors.boardDoesNotHaveContents" };
        const contents = await contentResult.arrayBuffer() as Uint8Array;

        return {
            status: 200,
            result: contents,
        };
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function createBoard(data : BoardCreationData) : Promise<ApiResponse<Board>> {
    try {
        const validated = BoardCreationSchema.safeParse(data);
        if (!validated.success)
            return { status: 400, error: validated.error.message };

        return (await (await fetch("/api/boards/", {
            method: "POST",
            body: JSON.stringify(data),
            credentials: "include",
        })).json());
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function saveBoardContents(id : string, contents : Uint8Array) : Promise<ApiResponse<string>> {
    try {
        return (await (await fetch(`/api/boards/${id}/contents`, {
            method: "PUT",
            body: contents,
            credentials: "include",
        })).json());
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function saveBoardData(id : string, data : BoardUpdateData) : Promise<ApiResponse> {
    try {
        return (await (await fetch(`/api/boards/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
            credentials: "include",
        })).json());
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}

export async function saveBoardsData(data : BoardsUpdateData) : Promise<ApiResponse> {
    try {
        return (await (await fetch("/api/boards", {
            method: "PUT",
            body: JSON.stringify(data),
            credentials: "include",
        })).json());
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}
