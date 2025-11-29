export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    username: string;
    token?: string;
}
/**
 * 登录接口
 * POST /auth/login
 */
export declare function login(data: LoginRequest): any;
