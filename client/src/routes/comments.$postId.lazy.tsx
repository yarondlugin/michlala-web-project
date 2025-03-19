import { createLazyFileRoute } from '@tanstack/react-router';
import { CommentsPage } from '../components/pages/CommentsPage';
import { useNavbar } from '../hooks/useNavbar';
import { useRestrictedPage } from '../hooks/useRestrictedPage';

const Comments = () => {
    useRestrictedPage();
    const Navbar = useNavbar();

    const { postId } = Route.useParams();
    return (
        <>
            <Navbar />
            <CommentsPage postId={postId} />;
        </>
    );
};

export const Route = createLazyFileRoute('/comments/$postId')({
    component: Comments,
});
