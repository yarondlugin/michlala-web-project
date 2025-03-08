import { createLazyFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '../components/pages/ProfilePage';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { useNavbar } from '../hooks/useNavbar';
import { PageBox } from '../components/PageBox';

const Profile = () => {
    const cookieDetails = useRestrictedPage();
    const Navbar = useNavbar();

    return (
        cookieDetails && (
            <>
                <Navbar />
                <PageBox>
                    <ProfilePage userId={cookieDetails?.userId} isEditable={true} />
                </PageBox>
            </>
        )
    );
};

export const Route = createLazyFileRoute('/profile')({
    component: Profile,
});
