import { createLazyFileRoute } from '@tanstack/react-router';
import { LoginPage } from '../components/pages/LoginPage';

export const Route = createLazyFileRoute('/login')({
    component: LoginPage,
});
