import BathtubIcon from '@mui/icons-material/Bathtub';
import MenuIcon from '@mui/icons-material/Menu';
import { SxProps } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useNavigate } from '@tanstack/react-router';
import { MouseEvent, useMemo, useState } from 'react';
import { ProfilePicture } from '../components/ProfilePicture';
import { useLogout } from './useLogout';
import { useMyDetails } from './useMyDetails';
import { useRestrictedPage } from './useRestrictedPage';

type MenuItem = {
    title: string;
    onClick?: () => void;
};

const NAVBAR_ITEMS = ['Feed', 'Profile'];
const USER_ITEMS = ['Profile', 'Logout'];

const XS_DISPLAY: SxProps = { display: { xs: 'flex', md: 'none' } };
const MD_DISPLAY: SxProps = { display: { xs: 'none', md: 'flex' } };
const LOGO_STYLES: SxProps = { marginRight: 2, fontFamily: 'Julius Sans One', letterSpacing: '.3rem' };

export const useNavbar = () => () => {
    const [navbarAnchorElement, setNavbarAnchorElement] = useState<null | HTMLElement>(null);
    const [userAnchorElement, setUserAnchorElement] = useState<null | HTMLElement>(null);
    const cookieDetails = useRestrictedPage();
    const { userResult: myDetails } = useMyDetails(cookieDetails?.userId);

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
        <AppBar position='sticky' sx={{ width: '100%', top: 0, }}>
            <Container>
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 1, ...XS_DISPLAY }}>
                        <IconButton size='large' onClick={handleOpenNavbarMenu}>
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
                            disableScrollLock
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
                        variant='h5'
                        noWrap
                        sx={{
                            ...XS_DISPLAY,
                            ...LOGO_STYLES,
                            flexGrow: 1,
                        }}
                    >
                        SHOWER
                    </Typography>

                    <BathtubIcon sx={{ ...MD_DISPLAY, marginRight: 1 }} />
                    <Typography
                        variant='h6'
                        noWrap
                        sx={{
                            ...MD_DISPLAY,
                            ...LOGO_STYLES,
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
                        <Tooltip title='User Settings'>
                            <IconButton onClick={handleOpenUserMenu} sx={{ padding: 0 }}>
                                <ProfilePicture
                                    profilePictureURL={
                                        myDetails?.profilePictureURL && `${import.meta.env.VITE_SERVER_URL}/${myDetails.profilePictureURL}`
                                    }
                                    sx={{ marginRight: '2%' }}
                                />
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
                            disableScrollLock
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
