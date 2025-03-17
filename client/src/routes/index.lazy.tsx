import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

const Index = () => {
    const navigate = useNavigate();

    useEffect(() => {
        navigate({ to: '/feed', replace: true });
    }, []);

    return null;
};

export const Route = createLazyFileRoute('/')({
    component: Index,
});
