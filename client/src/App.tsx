import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { IsAlive } from './components/IsAlive';
import { CookiesProvider, useCookies } from 'react-cookie';
import { Login } from './components/Login';
import { createTheme, ThemeProvider } from '@mui/material';
import { LogoutButton } from './components/LogoutButton';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const queryClient = new QueryClient();

const App = () => {
    const [{ accessToken, refreshToken: _refreshToken }, setCookie] = useCookies(['accessToken', 'refreshToken']);

    return (
        <ThemeProvider theme={darkTheme}>
            <QueryClientProvider client={queryClient}>
                <CookiesProvider>
                    {accessToken ? (
                        <>
                            <h1>Vite + React</h1>
                            <IsAlive />
                            <LogoutButton />
                        </>
                    ) : (
                        <Login />
                    )}
                </CookiesProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
};

export default App;
