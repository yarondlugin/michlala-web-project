import { createLazyFileRoute } from '@tanstack/react-router';
import { FeedPage } from '../components/pages/FeedPage';
import { useRestrictedPage } from '../hooks/useRestrictedPage';

const Feed = () => {
    useRestrictedPage();

    return <FeedPage />;
};

export const Route = createLazyFileRoute('/feed')({
    component: Feed,
});
