export interface ApiResponse<Data = {}> {
    status : number;
    result ?: Data;
    error ?: string;
}
