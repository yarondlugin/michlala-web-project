import { createLazyFileRoute } from '@tanstack/react-router';
import { FeedPage } from '../components/pages/FeedPage';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { useNavbar } from '../hooks/useNavbar';
import { PageBox } from '../components/PageBox';

const Feed = () => {
    useRestrictedPage();
    const Navbar = useNavbar();

    return (
        <>
            <Navbar />
            <PageBox>
                <FeedPage />
            </PageBox>
        </>
    );
};

export const Route = createLazyFileRoute('/feed')({
    component: Feed,
});
