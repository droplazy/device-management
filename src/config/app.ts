const env = (import.meta as any).env ?? import.meta.env ?? {}

export const useMockData = env.VITE_USE_MOCK === 'true'

export const apiCredentials = {
  username: env.VITE_API_USERNAME || 'user123',
  password: env.VITE_API_PASSWORD || 'securePassword123',
}


