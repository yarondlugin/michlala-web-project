import { createLazyFileRoute } from '@tanstack/react-router';
import { LoginPage } from '../components/pages/LoginPage';
import { PageBox } from '../components/PageBox';

const Login = () => {
    return (
        <PageBox>
            <LoginPage />
        </PageBox>
    );
};

export const Route = createLazyFileRoute('/login')({
    component: Login,
});
