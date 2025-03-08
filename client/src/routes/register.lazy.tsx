import { createLazyFileRoute } from '@tanstack/react-router'
import { RegisterPage } from '../components/pages/RegisterPage'
import { PageBox } from '../components/PageBox';

const Register = () => {
	return (
		<PageBox>
			<RegisterPage />
		</PageBox>
	);
};

export const Route = createLazyFileRoute('/register')({
  component: Register,
})
