import { useNavigate } from '@tanstack/react-router';
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { axiosClient } from '../queries/axios';
import { CookieDetails } from '../types/general';

export const useRestrictedPage = () => {
    const [cookies] = useCookies(['accessToken', 'refreshToken']);
    const navigate = useNavigate();
    const { accessToken, refreshToken } = cookies;

    useEffect(() => {
        if (!accessToken) {
            if (refreshToken) {
                axiosClient.post('/auth/refresh', {}, { withCredentials: true }).catch(() => navigate({ to: '/login' }));
            } else {
                navigate({ to: '/login' });
            }
        }
    }, [cookies]);

    return accessToken ? (jwtDecode(accessToken) as CookieDetails) : null;
};
