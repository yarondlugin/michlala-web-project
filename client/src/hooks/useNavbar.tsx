import { useState, useMemo, MouseEvent } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import BathtubIcon from '@mui/icons-material/Bathtub';
import { useNavigate } from '@tanstack/react-router';
import { useLogout } from './useLogout';
import { SxProps } from '@mui/material';

interface MenuItem {
    title: string;
    onClick?: () => void;
}

const NAVBAR_ITEMS = ['Feed', 'Profile'];
const USER_ITEMS = ['Profile', 'Logout'];

const XS_DISPLAY: SxProps = { display: { xs: 'flex', md: 'none' } };
const MD_DISPLAY: SxProps = { display: { xs: 'none', md: 'flex' } };

export const useNavbar = () => () => {
    const [navbarAnchorElement, setNavbarAnchorElement] = useState<null | HTMLElement>(null);
    const [userAnchorElement, setUserAnchorElement] = useState<null | HTMLElement>(null);

    const logout = useLogout();
    const navigate = useNavigate();

    const handleOpenNavbarMenu = (event: MouseEvent<HTMLElement>) => {
        setNavbarAnchorElement(event.currentTarget);
    };
    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setUserAnchorElement(event.currentTarget);
    };

    const handleCloseNavbarMenu = () => {
        setNavbarAnchorElement(null);
    };

    const handleCloseUserMenu = () => {
        setUserAnchorElement(null);
    };

    const navbarMenuItems = useMemo(() => {
        return NAVBAR_ITEMS.map((item) => ({
            title: item,
            onClick: () => navigate({ to: `/${item.toLowerCase()}` }),
        }));
    }, [navigate]);

    const settingsMenuItems = useMemo(() => {
        return USER_ITEMS.map((item) => ({
            title: item,
            onClick: () => {
                if (item === 'Logout') {
                    logout();
                } else {
                    navigate({ to: `/${item.toLowerCase()}` });
                }
            },
        }));
    }, [logout]);

    return (
        <AppBar position="fixed" sx={{ width: '100%', top: 0 }}>
            <Container>
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 1, ...XS_DISPLAY }}>
                        <IconButton size="large" onClick={handleOpenNavbarMenu}>
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            anchorEl={navbarAnchorElement}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(navbarAnchorElement)}
                            onClose={handleCloseNavbarMenu}
                            sx={XS_DISPLAY}
                        >
                            {navbarMenuItems.map(({ title, onClick }) => (
                                <MenuItem key={title} onClick={onClick}>
                                    <Typography sx={{ textAlign: 'center' }}>{title}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <BathtubIcon sx={{ ...XS_DISPLAY, marginRight: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        sx={{
                            ...XS_DISPLAY,
                            marginRight: 2,
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        SHOWER
                    </Typography>

                    <BathtubIcon sx={{ ...MD_DISPLAY, marginRight: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            ...MD_DISPLAY,
                            marginRight: 2,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                        }}
                    >
                        SHOWER THOUGHTS 
                    </Typography>
                    <Box sx={{ flexGrow: 1, ...MD_DISPLAY }}>
                        {navbarMenuItems.map(({ title, onClick }) => (
                            <Button key={title} onClick={onClick} sx={{ marginY: 2, color: 'white', display: 'block' }}>
                                {title}
                            </Button>
                        ))}
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="User Settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ padding: 0 }}>
                                <Avatar alt="User" src="/static/images/avatar/user.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ marginTop: '45px' }}
                            anchorEl={userAnchorElement}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            open={Boolean(userAnchorElement)}
                            onClose={handleCloseUserMenu}
                        >
                            {settingsMenuItems.map(({ title, onClick }) => (
                                <MenuItem key={title} onClick={onClick}>
                                    <Typography sx={{ textAlign: 'center' }}>{title}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
