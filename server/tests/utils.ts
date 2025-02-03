import httpStatus from 'http-status';
import request from 'supertest';
import { app } from '../index';

export const login = async (username: string, email: string) => {
	await request(app).post('/auth/register').send({
		email,
		username,
		password: 'password',
	});

	const loginResponse = await request(app)
		.post('/auth/login')
		.send({
			username,
			password: 'password',
		})
		.expect(httpStatus.OK);
	const accessToken = loginResponse.body.accessToken;

	const userResponse = await request(app)
		.get('/users')
		.query({ username })
		.set('Authorization', `Bearer ${accessToken}`)
		.expect(httpStatus.OK);
	const userId = userResponse.body._id;

	return { accessToken, userId };
};
