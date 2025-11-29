import { post } from './http';
/**
 * 登录接口
 * POST /auth/login
 */
export function login(data) {
    return post('/auth/login', {
        timestamp: new Date().toISOString(),
        data,
    });
}
