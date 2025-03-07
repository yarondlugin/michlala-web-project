import { createLazyFileRoute } from '@tanstack/react-router';
import { FeedPage } from '../components/pages/FeedPage';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { useNavbar } from '../hooks/useNavbar';

const Feed = () => {
    useRestrictedPage();
    const Navbar = useNavbar();

    return (
        <>
            <Navbar />
            <FeedPage />
        </>
    );
};

export const Route = createLazyFileRoute('/feed')({
    component: Feed,
});
