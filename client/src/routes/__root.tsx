import { ThemeProvider } from '@emotion/react';
import { Box, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { CookiesProvider } from 'react-cookie';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <ThemeProvider theme={darkTheme}>
                <QueryClientProvider client={queryClient}>
                    <CookiesProvider>
                        <Outlet />
                        <TanStackRouterDevtools />
                    </CookiesProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </Box>
    ),
    notFoundComponent: () => {
        return <p>This page doesn't exist!</p>;
    },
});
