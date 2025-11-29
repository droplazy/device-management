import axios from 'axios';
const baseURL = import.meta.env?.VITE_API_BASE ||
    (import.meta.env ? import.meta.env.VITE_API_BASE : undefined) ||
    '/api';
export const apiClient = axios.create({
    baseURL,
    timeout: 15000,
});
apiClient.interceptors.response.use((response) => response, (error) => {
    // 可以在这里统一处理错误提示
    return Promise.reject(error);
});
export function get(url, config) {
    return apiClient.get(url, config).then((res) => res.data);
}
export function post(url, data, config) {
    return apiClient.post(url, data, config).then((res) => res.data);
}
