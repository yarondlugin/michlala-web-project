import { Button } from '@mui/material';
import { useLogout } from '../hooks/useLogout';

export const LogoutButton = () => {
    const { logout } = useLogout();

    return (
        <Button variant='contained' sx={{ width: '100px' }} onClick={logout}>
            Logout
        </Button>
    );
};
