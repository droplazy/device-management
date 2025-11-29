import { post } from './http'
import type { ApiResponse } from './http'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  username: string
  token?: string
}

/**
 * 登录接口
 * POST /auth/login
 */
export function login(data: LoginRequest) {
  return post<ApiResponse<LoginResponse>>('/auth/login', {
    timestamp: new Date().toISOString(),
    data,
  })
}

