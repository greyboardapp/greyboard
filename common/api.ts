export interface ApiResponse<T> {
    status : number;
    error ?: string;
    result ?: T;
}
