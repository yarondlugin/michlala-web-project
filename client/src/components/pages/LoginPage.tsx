import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Card, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useGoogleLogin } from '@react-oauth/google';
import { useUserDetailsInputs } from '../../hooks/useUserDetailsInputs';
import { axiosClient } from '../../queries/axios';

export const LoginPage = () => {
    const [errorMessage, setErrorMessage] = useState<string>();
    const [cookies] = useCookies(['refreshToken', 'accessToken']);
    const navigate = useNavigate({ from: '/login' });

    const handleLogin = async (googleAuthCode?: string) => {
        await setErrorMessage('');
        try {
            if (googleAuthCode) {
                await axiosClient.post('/auth/login/google', { code: googleAuthCode });
            } else {
                await axiosClient.post('/auth/login', { username: email, password });
            }
        } catch (error) {
            if (isAxiosError(error)) {
                const errorFromServer = error.response?.data?.message;

                if (errorFromServer) {
                    setErrorMessage(errorFromServer);
                    return;
                }
            }
            setErrorMessage('Something went wrong, please try again');
        }
    };
    const { email, emailComponent, password, passwordComponent } = useUserDetailsInputs({ onSubmit: handleLogin });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async ({ code }) => handleLogin(code),
        flow: 'auth-code',
    });

    useEffect(() => {
        const { accessToken } = cookies;
        if (accessToken) {
            navigate({ to: '/profile' });
        }
    }, [cookies]);

    return (
        <Card
            sx={{
                width: '70vw',
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                alignItems: 'center',
            }}
        >
            <Typography fontSize={64}>Welcome!</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
                {emailComponent}
                {passwordComponent}
                <Typography color="red">{errorMessage}</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Button variant="contained" sx={{ width: '10%', marginBottom: '1rem', }} onClick={() => handleLogin()}>
                    Login
                </Button>
                <Button variant="outlined" sx={{ width: '10%' }} onClick={() => navigate({ to: '/register' })}>
                    Sign Up
                </Button>
            </Box>
            <Button onClick={() => handleGoogleLogin()} endIcon={<GoogleIcon />}>
                Sign in with Google
            </Button>
        </Card>
    );
};
