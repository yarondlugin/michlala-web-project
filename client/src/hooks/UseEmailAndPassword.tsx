import { TextField } from '@mui/material';
import { useState } from 'react';

type UseEmailAndPasswordArgs = {
    onSubmit?: () => void | Promise<void>;
};

export const useEmailAndPassword = ({ onSubmit }: UseEmailAndPasswordArgs) => {
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();

    const handleEmailChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPassword(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onSubmit?.();
        }
    };

    return {
        email,
        password,
        setEmail,
        setPassword,
        emailComponent: (
            <TextField
                placeholder='Email/Username'
                value={email}
                onChange={handleEmailChanged}
                sx={{ marginBottom: '5%' }}
                onKeyDown={handleKeyDown}
            ></TextField>
        ),
        passwordComponent: (
            <TextField
                placeholder='Password'
                type='password'
                value={password}
                onChange={handlePasswordChanged}
                onKeyDown={handleKeyDown}
            ></TextField>
        ),
    };
};
