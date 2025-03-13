import { createLazyFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '../components/pages/ProfilePage';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { useNavbar } from '../hooks/useNavbar';

const Profile = () => {
    const cookieDetails = useRestrictedPage();
    const Navbar = useNavbar();

    return (
        cookieDetails && (
            <>
                <Navbar />
                <ProfilePage userId={cookieDetails?.userId} isEditable={true} />
            </>
        )
    );
};

export const Route = createLazyFileRoute('/profile')({
    component: Profile,
});
