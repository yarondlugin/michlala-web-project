import { TextField } from '@mui/material';
import { useState } from 'react';

type UseEmailAndPasswordArgs = {
    onSubmit?: () => void | Promise<void>;
};

export const useUserDetailsInputs = ({ onSubmit }: UseEmailAndPasswordArgs) => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleUsernameChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUsername(event.target.value);
    };

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
		username,
		setUsername,
        email,
        password,
        setEmail,
        setPassword,
        usernameComponent: (
            <TextField
                placeholder='Username'
                value={username}
                onChange={handleUsernameChanged}
                sx={{ marginBottom: '5%' }}
                onKeyDown={handleKeyDown}
            ></TextField>
        ),
        emailComponent: (
            <TextField
                placeholder='Email'
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
