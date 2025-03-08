import { createLazyFileRoute } from '@tanstack/react-router';
import { IsAlive } from '../components/pages/IsAlive';
import { useRestrictedPage } from '../hooks/useRestrictedPage';

const Index = () => {
    useRestrictedPage();

    return <IsAlive />;
};

export const Route = createLazyFileRoute('/')({
    component: Index,
});
