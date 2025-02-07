import httpStatus from 'http-status';
import request from 'supertest';
import { app } from '../index';
import { Response } from 'supertest';

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
	const cookies = parseResponseCookies(loginResponse);
	const accessToken = cookies.accessToken;

	const userResponse = await request(app)
		.get('/users')
		.query({ username })
		.set('Authorization', `Bearer ${accessToken}`)
		.expect(httpStatus.OK);
	const userId = userResponse.body._id;

	return { accessToken, userId };
};

export const parseResponseCookies = (response: Response) =>
	((response.headers['set-cookie'] as unknown as string[]) || ([] as string[]))
		.map((setCookie) => {
			const [key, value] = setCookie.split(';')?.[0]?.split('=');
			return { [key?.trim()]: value?.trim() };
		})
		.reduce((previous, current) => ({ ...previous, ...current }), {});
