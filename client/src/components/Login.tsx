import { Box, Button, Card, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useEmailAndPassword } from '../hooks/UseEmailAndPassword';
import { axiosClient } from '../queries/axios';

export const Login = () => {
    const [errorMessage, setErrorMessage] = useState<string>();
    const [cookies] = useCookies(['refreshToken', 'accessToken']);
    const navigate = useNavigate({ from: '/login' });

    const handleLogin = async () => {
        try {
            await axiosClient.post('/auth/login', { username: email, password }, { withCredentials: true });
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
    const { email, emailComponent, password, passwordComponent } = useEmailAndPassword({ onSubmit: handleLogin });

    useEffect(() => {
        const { accessToken, refreshToken } = cookies;
        if (accessToken) {
            navigate({ to: '/' });
        }

        if (refreshToken) {
            axiosClient.post('/auth/refresh', {}, { withCredentials: true }).then(() => navigate({ to: '/' }));
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
            <Button variant="contained" sx={{ width: '10%' }} onClick={handleLogin}>
                Login
            </Button>
        </Card>
    );
};
