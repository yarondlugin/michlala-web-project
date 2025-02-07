import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { IsAlive } from '../components/IsAlive';
import { LogoutButton } from '../components/LogoutButton';

const Index = () => {
    const [cookies] = useCookies(['accessToken']);
    const navigate = useNavigate({ from: '/' });

    useEffect(() => {
        const { accessToken } = cookies;
        if (!accessToken) {
            navigate({ to: '/login' });
        }
    }, [cookies]);

    return (
        <>
            <IsAlive />
            <LogoutButton />
        </>
    );
};

export const Route = createLazyFileRoute('/')({
    component: Index,
});
