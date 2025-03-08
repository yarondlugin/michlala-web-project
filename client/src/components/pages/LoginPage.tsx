import GoogleIcon from '@mui/icons-material/Google';
import { Box, Button, Card, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useGoogleLogin } from '@react-oauth/google';
import { useUserDetailsInputs } from '../../hooks/useUserDetailsInputs';
import { axiosClient } from '../../queries/axios';
import { PageBox } from '../PageBox';

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
                await axiosClient.post('/auth/login', { username: usernameOrEmail, password });
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
    const {
        username: usernameOrEmail,
        usernameComponent,
        password,
        passwordComponent,
    } = useUserDetailsInputs({ onSubmit: handleLogin, usernamePlaceholder: 'Username / Email' });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async ({ code }) => handleLogin(code),
        flow: 'auth-code',
    });

    useEffect(() => {
        const { accessToken } = cookies;
        if (accessToken) {
            navigate({ to: '/feed' });
        }
    }, [cookies]);

    return (
        <PageBox sx={{ justifyContent: 'center' }}>
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
                    {usernameComponent}
                    {passwordComponent}
                    <Typography color='red'>{errorMessage}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Button variant='contained' sx={{ width: '10%', marginBottom: '1%' }} onClick={() => handleLogin()}>
                        Login
                    </Button>
                    <Typography color='primary'>Don't have an account?</Typography>
                    <Typography
                        color='primary'
                        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => navigate({ to: '/register' })}
                    >
                        Register
                    </Typography>
                </Box>
                <Button onClick={() => handleGoogleLogin()} endIcon={<GoogleIcon />}>
                    Login with Google
                </Button>
            </Card>
        </PageBox>
    );
};
