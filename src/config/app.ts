const env = (import.meta as any).env ?? import.meta.env ?? {}

export const useMockData = env.VITE_USE_MOCK === 'true'


