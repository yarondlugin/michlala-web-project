import { Box, Button, Card, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { HttpStatusCode, isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useGoogleLogin } from '@react-oauth/google';
import { Dialog } from '@base-ui-components/react';
import { useEmailAndPassword } from '../hooks/UseEmailAndPassword';
import { axiosClient } from '../queries/axios';
import { useDialog } from '../hooks/useDialog';

export const Login = () => {
    const [errorMessage, setErrorMessage] = useState<string>();
    const [cookies] = useCookies(['refreshToken', 'accessToken']);
    const navigate = useNavigate({ from: '/login' });
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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
                if (error.response?.status === HttpStatusCode.Conflict) {
                    await setDialogOpen(true);
                    await setEmail(error.response?.data?.email);
                    return;
                }

                if (errorFromServer) {
                    setErrorMessage(errorFromServer);
                    return;
                }
            }
            setErrorMessage('Something went wrong, please try again');
        }
    };
    const { email, setEmail, emailComponent, password, passwordComponent } = useEmailAndPassword({ onSubmit: handleLogin });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async ({ code }) => handleLogin(code),
        flow: 'auth-code',
    });

    useEffect(() => {
        const { accessToken, refreshToken } = cookies;
        if (accessToken) {
            navigate({ to: '/' });
        }

        if (refreshToken) {
            axiosClient.post('/auth/refresh', {}, { withCredentials: true }).then(() => navigate({ to: '/' }));
        }
    }, [cookies]);

    const { dialogComponent } = useDialog({
        title: 'User Exists With This Email',
        description: `A user using this email and a password already exists.
			If you wish to convert your user to a Google account,
			please log in with your password and convert from your profile page.`,
        cancelText: 'Ok, log in with password',
        onCancel: () => setDialogOpen(false),
    });

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
            <Button variant="contained" sx={{ width: '10%' }} onClick={() => handleLogin()}>
                Login
            </Button>
            <Button onClick={() => handleGoogleLogin()}>Sign in with Google</Button>
            <Dialog.Root open={dialogOpen}>{dialogComponent}</Dialog.Root>
        </Card>
    );
};
