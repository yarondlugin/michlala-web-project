import { Button } from '@mui/material';
import { useCookies } from 'react-cookie';

export const LogoutButton = () => {
    const [_, __, removeCookie] = useCookies(['accessToken', 'refreshToken']);

    const logout = () => {
        removeCookie('accessToken');
        removeCookie('refreshToken');
    };

    return (
        <Button variant='contained' sx={{ width: '100px' }} onClick={logout}>
            Logout
        </Button>
    );
};
