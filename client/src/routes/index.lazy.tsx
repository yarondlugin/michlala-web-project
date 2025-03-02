import { createLazyFileRoute } from '@tanstack/react-router';
import { IsAlive } from '../components/pages/IsAlive';
import { LogoutButton } from '../components/LogoutButton';
import { useRestrictedPage } from '../hooks/useRestrictedPage';

const Index = () => {
    useRestrictedPage();

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
