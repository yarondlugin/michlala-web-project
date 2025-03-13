import { Box, Button, Card, Typography } from '@mui/material';
import { isAxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useUserDetailsInputs } from '../../hooks/useUserDetailsInputs';
import { axiosClient } from '../../queries/axios';
import { PageBox } from '../PageBox';

export const RegisterPage = () => {
    const [errorMessage, setErrorMessage] = useState<string>('');
    const navigate = useNavigate({ from: '/register' });

    const handleRegister = async () => {
        await setErrorMessage('');
        try {
            await axiosClient.post('/auth/register', { username, email, password }, { withCredentials: true });
            navigate({ to: '/login' });
        } catch (error) {
            if (isAxiosError(error)) {
                const errorFromServer = error.response?.data?.message;
                if (error.response?.data.conflictingDetails) {
                    const { username, email } = error.response.data.conflictingDetails;
                    if (username) {
                        setErrorMessage('Username already exists');
                        return;
                    }
                    if (email) {
                        setErrorMessage('Email already exists');
                        return;
                    }
                }
                if (errorFromServer) {
                    setErrorMessage(errorFromServer);
                    return;
                }
            }
            setErrorMessage('Something went wrong, please try again');
        }
    };

    const { username, usernameComponent, email, emailComponent, password, passwordComponent } = useUserDetailsInputs({
        onSubmit: handleRegister,
    });

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
                <Typography fontSize={64}>Create Account</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center' }}>
                    {usernameComponent}
                    {emailComponent}
                    {passwordComponent}
                    <Typography color='red'>{errorMessage}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Button variant='contained' sx={{ width: '10%', marginBottom: '3%' }} onClick={handleRegister}>
                        Register
                    </Button>
                    <Typography color='primary'>Already have an account?</Typography>
                    <Typography
                        color='primary'
                        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => navigate({ to: '/login' })}
                    >
                        Login
                    </Typography>
                </Box>
            </Card>
        </PageBox>
    );
};
