import { ThemeProvider } from '@emotion/react';
import { Box, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { CookiesProvider } from 'react-cookie';
import { ErrorCard } from '../components/ErrorCard';
import { PageBox } from '../components/PageBox';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    typography: {
        fontFamily: 'Quicksand, Roboto',
    },
});

const queryClient = new QueryClient();

export const Route = createRootRoute({
    component: () => (
        <Box id='root-box' sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <QueryClientProvider client={queryClient}>
                    <CookiesProvider>
                        <Outlet />
                    </CookiesProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </Box>
    ),
    notFoundComponent: () => {
        return (
            <PageBox sx={{ justifyContent: 'center', alignContent: 'center' }}>
                <ErrorCard title='Page Not Found' message="We couldn't find the page you're looking for" showBackToFeedButton />
            </PageBox>
        );
    },
});
