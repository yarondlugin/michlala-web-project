import { expect } from '@jest/globals';
import httpStatus from 'http-status';
import request from 'supertest';
import { app } from '../index';
import { closeDB } from '../services/db';

afterAll(() => {
	closeDB();
});

describe('Authentication API', () => {
	let accessToken: string;
	let refreshToken: string;
	let oldRefreshToken: string;

	const getAuthorizationHeader = () => ({ Authorization: `Bearer ${accessToken}` });

	beforeAll(async () => {
		await request(app).post('/auth/register').send({
			username: 'auth-test-user',
			email: 'auth-test-user@gmail.com',
			password: 'password',
		});
	});

	describe('Positive Authentication Tests', () => {
		it('should login a user', async () => {
			const response = await request(app)
				.post('/auth/login')
				.send({
					username: 'auth-test-user',
					password: 'password',
				})
				.expect(httpStatus.OK);

			expect(response.body).toHaveProperty('accessToken');
			expect(response.body).toHaveProperty('refreshToken');

			accessToken = response.body.accessToken;
			refreshToken = response.body.refreshToken;
		});

		it('should be able to access /posts with a valid token', async () => {
			const response = await request(app).get('/posts').set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
		});

		it('should refresh tokens', async () => {
			const response = await request(app).post('/auth/refresh').send({ refreshToken }).expect(httpStatus.OK);

			expect(response.body).toHaveProperty('accessToken');
			expect(response.body).toHaveProperty('refreshToken');
			expect(response.body.accessToken).not.toBe(accessToken);
			expect(response.body.refreshToken).not.toBe(refreshToken);

			accessToken = response.body.accessToken;
			oldRefreshToken = refreshToken;
			refreshToken = response.body.refreshToken;
		});

		it('should be able to access /posts with a valid token (after refresh)', async () => {
			const response = await request(app).get('/posts').set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
		});

		it('should logout a user', async () => {
			const response = await request(app).post('/auth/logout').set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(response.body.message).toBe('Logged out successfully');
		});
	});

	describe('Negative Authentication Tests', () => {
		it('should not login with invalid credentials', async () => {
			await request(app)
				.post('/auth/login')
				.send({
					username: 'auth-test-user',
					password: 'wrongpassword',
				})
				.expect(httpStatus.UNAUTHORIZED);
		});

		it('should not refresh tokens with invalid token', async () => {
			await request(app).post('/auth/refresh').send({ refreshToken: 'invalidtoken' }).expect(httpStatus.UNAUTHORIZED);
		});

		it('should not access /posts with an invalid token', async () => {
			await request(app).get('/posts').set({ Authorization: 'Bearer invalidtoken' }).expect(httpStatus.UNAUTHORIZED);
		});

		it('should not access /posts with no token', async () => {
			await request(app).get('/posts').expect(httpStatus.UNAUTHORIZED);
		});

		it('should not let refresh token be used as access token', async () => {
			await request(app)
				.get('/posts')
				.set({ Authorization: `Bearer ${refreshToken}` })
				.expect(httpStatus.UNAUTHORIZED);
		});

		it('should not let access token be used as refresh token', async () => {
			await request(app).post('/auth/refresh').send({ refreshToken: accessToken }).expect(httpStatus.UNAUTHORIZED);
		});

		it('should not refresh token with no token', async () => {
			await request(app).post('/auth/refresh').expect(httpStatus.BAD_REQUEST);
		});

		it('should not refresh token with an old token', async () => {
			await request(app).post('/auth/refresh').send({ refreshToken: oldRefreshToken }).expect(httpStatus.UNAUTHORIZED);
		});
	});
});
