import { useCookies } from 'react-cookie';

export const useLogout = () => {
    const [_, __, removeCookie] = useCookies(['accessToken', 'refreshToken']);

    const logout = () => {
        removeCookie('accessToken');
        removeCookie('refreshToken');
    };

	return logout;
};
