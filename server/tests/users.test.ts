import { expect } from '@jest/globals';
import httpStatus from 'http-status';
import request from 'supertest';
import { app } from '../index';

import { closeDB } from '../services/db';
import { login } from './utils';

afterAll(() => {
	closeDB();
});

describe('Users API', () => {
	let userId: string;
	let accessToken: string;

	const getAuthorizationHeader = () => ({ Authorization: `Bearer ${accessToken}` });

	beforeAll(async () => {
		const { accessToken: newAccessToken, userId: newUserId } = await login('users-test-user', 'testuser@example.com');
		userId = newUserId;
		accessToken = newAccessToken;
	});

	describe('Positive tests', () => {
		it('should get a user by details', async () => {
			const response = await request(app)
				.get('/users')
				.set(getAuthorizationHeader())
				.query({ username: 'users-test-user' })
				.expect(httpStatus.OK);

			expect(response.body._id).toBe(userId);
			expect(response.body.username).toBe('users-test-user');
		});

		it('should get a user by id', async () => {
			const response = await request(app).get(`/users/${userId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(response.body).toHaveProperty('_id', userId);
			expect(response.body.username).toBe('users-test-user');
		});

		it('should update a user by id', async () => {
			const response = await request(app)
				.put(`/users/${userId}`)
				.set(getAuthorizationHeader())
				.send({
					email: 'updateduser@example.com',
				})
				.expect(httpStatus.OK);

			expect(response.text).toBe(`User ${userId} updated`);

			const updatedUserResponse = await request(app).get(`/users/${userId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(updatedUserResponse.body.email).toBe('updateduser@example.com');
		});

		it('should delete a user by id', async () => {
			const response = await request(app).delete(`/users/${userId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(response.text).toBe(`User ${userId} deleted`);

			await request(app).get(`/users/${userId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});
	});

	describe('Negative tests', () => {
		it('should return 404 for getting non-existing user id', async () => {
			const nonExistingId = '6740aa79f7d3b27e1b049771';
			await request(app).get(`/users/${nonExistingId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});

		it('should return 400 for getting with invalid user id', async () => {
			const invalidId = 'invalid-id';
			await request(app).get(`/users/${invalidId}`).set(getAuthorizationHeader()).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 400 for updating user with invalid id', async () => {
			const invalidId = 'invalid-id';
			await request(app)
				.put(`/users/${invalidId}`)
				.set(getAuthorizationHeader())
				.send({
					email: 'updateduser@example.com',
				})
				.expect(httpStatus.BAD_REQUEST);
		});

		it('should return 400 for updating user with empty body', async () => {
			await request(app).put(`/users/${userId}`).set(getAuthorizationHeader()).send({}).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 400 for updating user with no body', async () => {
			await request(app).put(`/users/${userId}`).set(getAuthorizationHeader()).send().expect(httpStatus.BAD_REQUEST);
		});

		it('should return 400 for getting user with no filters', async () => {
			await request(app).get(`/users`).set(getAuthorizationHeader()).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 404 for updating non-existing user id', async () => {
			const nonExistingId = '6740aa79f7d3b27e1b049771';
			await request(app)
				.put(`/users/${nonExistingId}`)
				.set(getAuthorizationHeader())
				.send({
					email: 'updateduser@example.com',
				})
				.expect(httpStatus.NOT_FOUND);
		});

		it('should return 404 for deleting a non-existing user', async () => {
			const nonExistingId = '6740bcfcaa86a22352cb55e2';
			await request(app).delete(`/users/${nonExistingId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});
	});
});
