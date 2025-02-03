import { expect } from '@jest/globals';
import httpStatus from 'http-status';
import request from 'supertest';
import { app } from '../index';
import { Post } from '../models/posts';
import { closeDB } from '../services/db';
import { login } from './utils';

afterAll(() => {
	closeDB();
});

describe('Posts API', () => {
	let userId: string;
	let accessToken: string;

	const getAuthorizationHeader = () => ({ Authorization: `Bearer ${accessToken}` });

	beforeAll(async () => {
		const { accessToken: newAccessToken, userId: newUserId } = await login('posts-test-user', 'posts-test-user@gmail.com');
		accessToken = newAccessToken;
		userId = newUserId;
	});

	describe('Positive tests', () => {
		let postId: string;

		it('should create a new post', async () => {
			const response = await request(app)
				.post('/posts')
				.set(getAuthorizationHeader())
				.send({
					title: 'Test Post',
					content: 'This is a test post',
				})
				.expect(httpStatus.CREATED);

			expect(response.body).toHaveProperty('_id');
			expect(response.body.title).toBe('Test Post');
			expect(response.body.sender).toBe(userId);
			expect(response.body.content).toBe('This is a test post');

			postId = response.body._id;
		});

		it('should get all posts', async () => {
			const response = await request(app).get('/posts').set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
			expect(response.body.find(({ _id, sender }: Post) => _id === postId && sender === userId)).toBeDefined();
		});

		it('should get a post by id', async () => {
			const response = await request(app).get(`/posts/${postId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(response.body).toHaveProperty('_id', postId);
			expect(response.body.title).toBe('Test Post');
			expect(response.body.sender).toBe(userId);
			expect(response.body.content).toBe('This is a test post');
		});

		it('should update a post by id', async () => {
			const response = await request(app)
				.put(`/posts/${postId}`)
				.set(getAuthorizationHeader())
				.send({
					content: 'Updated content',
				})
				.expect(httpStatus.OK);

			expect(response.text).toBe('Updated successfully');

			const updatedPostResponse = await request(app).get(`/posts/${postId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(updatedPostResponse.body.content).toBe('Updated content');
		});

		it('should filter posts by sender', async () => {
			const response = await request(app)
				.get('/posts')
				.set(getAuthorizationHeader())
				.query({ sender: userId })
				.expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
			expect(response.body.every(({ sender }: Post) => sender === userId)).toBe(true);
		});
	});

	describe('Negative tests', () => {
		it('should return 404 for getting non-existing post id', async () => {
			const nonExistingId = '6740aa79f7d3b27e1b049771';
			await request(app).get(`/posts/${nonExistingId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});

		it('should return 400 for getting with invalid post id', async () => {
			const invalidId = 'invalid-id';
			await request(app).get(`/posts/${invalidId}`).set(getAuthorizationHeader()).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 400 for updating post with invalid id', async () => {
			const invalidId = 'invalid-id';
			await request(app)
				.put(`/posts/${invalidId}`)
				.set(getAuthorizationHeader())
				.send({
					content: 'Updated content',
				})
				.expect(httpStatus.BAD_REQUEST);
		});

		it('should return 404 for updating non-existing post id', async () => {
			const nonExistingId = '6740aa79f7d3b27e1b049771';
			await request(app)
				.put(`/posts/${nonExistingId}`)
				.set(getAuthorizationHeader())
				.send({
					content: 'Updated content',
				})
				.expect(httpStatus.NOT_FOUND);
		});

		it('should return 400 for missing title', async () => {
			await request(app)
				.post('/posts')
				.set(getAuthorizationHeader())
				.send({
					content: `This post doesn't have a title :O`,
				})
				.expect(httpStatus.BAD_REQUEST)
				.expect((response) => {
					expect(response.body).toHaveProperty('errors');
					expect(response.body.errors).toHaveProperty('title');
					expect(response.body.errors.title).toBe(`Path \`title\` is required.`);
				});
		});
	});
});
