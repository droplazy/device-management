import axios, { type AxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  timestamp: string
  code: number
  data: T
}

const baseURL =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta.env ? import.meta.env.VITE_API_BASE : undefined) ||
  '/api'

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 可以在这里统一处理错误提示
    return Promise.reject(error)
  },
)

export function get<T = any>(url: string, config?: AxiosRequestConfig) {
  return apiClient.get<T>(url, config).then((res) => res.data)
}

export function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
) {
  return apiClient.post<T>(url, data, config).then((res) => res.data)
}



