import { type AxiosRequestConfig } from 'axios';
export interface ApiResponse<T> {
    timestamp: string;
    code: number;
    data: T;
}
export declare const apiClient: import("axios").AxiosInstance;
export declare function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
export declare function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
