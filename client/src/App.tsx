import { createTheme, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CookiesProvider, useCookies } from 'react-cookie';
import './App.css';
import { IsAlive } from './components/IsAlive';
import { Login } from './components/Login';
import { LogoutButton } from './components/LogoutButton';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

const queryClient = new QueryClient();

const App = () => {
    const [{ accessToken }] = useCookies(['accessToken']);

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
