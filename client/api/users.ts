import { User } from "../../common/models/user";
import { ApiResponse } from "./api";

export async function getUser(email : string) : Promise<ApiResponse<User>> {
    try {
        return (await (await fetch(`/api/users/${email}`, { credentials: "include" })).json());
    } catch (e) {
        return { status: 500, error: "errors.apiNotAvailable" };
    }
}
