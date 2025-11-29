const env = import.meta.env ?? import.meta.env ?? {};
export const useMockData = env.VITE_USE_MOCK === 'true';
