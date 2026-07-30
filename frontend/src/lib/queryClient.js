import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 3,
            retryDelay: (attemptIdx) => {
                return Math.min(1000 * Math.pow(2, attemptIdx), 30000);
            },

            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            refetchOnMouth: true,
        },
        mutations: {
            retry: 1,
            retryDelay: 1000,
        }
    }
})