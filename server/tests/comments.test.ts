import { expect } from '@jest/globals';
import httpStatus from 'http-status';
import request from 'supertest';
import { app } from '../index';
import { closeDB } from '../services/db';
import { Comment } from '../models/comments';
import { login } from './utils';

afterAll(() => {
	closeDB();
});

describe('Comments API', () => {
	let userId: string;
	let accessToken: string;
	let commentId: string;
	let postId: string;

	const getAuthorizationHeader = () => ({ Authorization: `Bearer ${accessToken}` });

	beforeAll(async () => {
		const { accessToken: initialAccessToken, userId: newUserId } = await login(
			'comments-test-user',
			'comments-test-user@gmail.com'
		);
		accessToken = initialAccessToken;
		userId = newUserId;

		const response = await request(app).post('/posts').set(getAuthorizationHeader()).send({
			title: 'Test Post',
			content: 'This is a test post for comments',
		});

		postId = response.body._id;
	});

	describe('Positive tests', () => {
		it('should create a new comment', async () => {
			const response = await request(app)
				.post('/comments')
				.set(getAuthorizationHeader())
				.send({
					content: 'This is a test comment',
					postId,
				})
				.expect(httpStatus.CREATED);

			expect(response.body).toHaveProperty('_id');
			expect(response.body.sender).toBe(userId);
			expect(response.body.content).toBe('This is a test comment');
			expect(response.body.postId).toBe(postId);

			commentId = response.body._id;
		});

		it('should get all comments', async () => {
			const response = await request(app).get('/comments').set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
			expect(response.body.find(({ _id, sender }: Comment) => _id === commentId && sender === userId)).toBeDefined();
		});

		it('should get a comment by id', async () => {
			const response = await request(app).get(`/comments/${commentId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(response.body._id).toBe(commentId);
			expect(response.body.sender).toBe(userId);
			expect(response.body.content).toBe('This is a test comment');
		});

		it('should update a comment by id', async () => {
			const response = await request(app)
				.put(`/comments/${commentId}`)
				.set(getAuthorizationHeader())
				.send({
					content: 'Updated comment content',
				})
				.expect(httpStatus.OK);

			expect(response.text).toBe(`Comment ${commentId} updated`);

			const updatedCommentResponse = await request(app)
				.get(`/comments/${commentId}`)
				.set(getAuthorizationHeader())
				.expect(httpStatus.OK);

			expect(updatedCommentResponse.body.content).toBe('Updated comment content');
		});

		it('should filter comments by sender', async () => {
			const response = await request(app)
				.get('/comments')
				.set(getAuthorizationHeader())
				.query({ sender: userId })
				.expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
			expect(response.body.every(({ sender }: Comment) => sender === userId)).toBe(true);
		});

		it('should filter comments by post id', async () => {
			const response = await request(app).get('/comments').set(getAuthorizationHeader()).query({ postId }).expect(httpStatus.OK);

			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBeGreaterThan(0);
			expect(response.body.every(({ postId: id }: Comment) => (id as unknown as string) === postId)).toBe(true);
		});

		it('should filter comments by non-existent post id', async () => {
			const nonExistentPostId = '6740bcfcaa86a22352cb55e3';
			const response = await request(app)
				.get('/comments')
				.set(getAuthorizationHeader())
				.query({ postId: nonExistentPostId })
				.expect(httpStatus.OK);

			expect(response.body).toEqual([]);
		});

		it('should delete a comment by id', async () => {
			const response = await request(app).delete(`/comments/${commentId}`).set(getAuthorizationHeader()).expect(httpStatus.OK);

			expect(response.text).toBe(`comment ${commentId} deleted`);

			await request(app).get(`/comments/${commentId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});
	});

	describe('Negative tests', () => {
		it('should return 400 for invalid comment id', async () => {
			const invalidId = 'invalid-id';
			await request(app).get(`/comments/${invalidId}`).set(getAuthorizationHeader()).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 404 for non-existing comment id', async () => {
			const nonExistingId = '6740bcfcaa86a22352cb55e2';
			await request(app).get(`/comments/${nonExistingId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});

		it('should return 400 for creating a comment with invalid post id', async () => {
			const response = await request(app)
				.post('/comments')
				.set(getAuthorizationHeader())
				.send({
					content: 'This is a test comment',
					postId: 'invalid-post-id',
				})
				.expect(httpStatus.BAD_REQUEST);

			expect(response.text).toBe('Invalid post id "invalid-post-id"');
		});

		it('should return 400 for getting comments with invalid post id filter', async () => {
			const response = await request(app)
				.get('/comments')
				.set(getAuthorizationHeader())
				.query({ postId: 'invalid-post-id' })
				.expect(httpStatus.BAD_REQUEST);

			expect(response.text).toBe('Invalid post id "invalid-post-id"');
		});

		it('should return 400 for updating a comment with invalid id', async () => {
			const response = await request(app)
				.put('/comments/invalid-id')
				.set(getAuthorizationHeader())
				.send({
					content: 'Updated comment content',
				})
				.expect(httpStatus.BAD_REQUEST);

			expect(response.text).toBe('Invalid id "invalid-id"');
		});

		it('should return 400 for deleting a comment with invalid id', async () => {
			const response = await request(app)
				.delete('/comments/invalid-id')
				.set(getAuthorizationHeader())
				.expect(httpStatus.BAD_REQUEST);

			expect(response.text).toBe('Invalid id "invalid-id"');
		});

		it('should return 400 for creating a comment with non-existing post id', async () => {
			const response = await request(app)
				.post('/comments')
				.set(getAuthorizationHeader())
				.send({
					content: 'This is a test comment',
					postId: '6740bcfcaa86a22352cb55e3',
				})
				.expect(httpStatus.BAD_REQUEST);

			expect(response.text).toBe("Post with id 6740bcfcaa86a22352cb55e3 doesn't exist");
		});

		it('should return 400 for empty body', async () => {
			await request(app).put(`/comments/${commentId}`).set(getAuthorizationHeader()).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 400 for empty object body', async () => {
			await request(app).put(`/comments/${commentId}`).set(getAuthorizationHeader()).send({}).expect(httpStatus.BAD_REQUEST);
		});

		it('should return 404 for updating a non-existing comment', async () => {
			const nonExistingId = '6740bcfcaa86a22352cb55e2';
			await request(app)
				.put(`/comments/${nonExistingId}`)
				.set(getAuthorizationHeader())
				.send({
					content: 'Updated comment content',
				})
				.expect(httpStatus.NOT_FOUND);
		});

		it('should return 404 for deleting a non-existing comment', async () => {
			const nonExistingId = '6740bcfcaa86a22352cb55e2';
			await request(app).delete(`/comments/${nonExistingId}`).set(getAuthorizationHeader()).expect(httpStatus.NOT_FOUND);
		});

		it('should return 400 for missing content', async () => {
			await request(app)
				.post('/comments')
				.set(getAuthorizationHeader())
				.send({
					postId,
				})
				.expect(httpStatus.BAD_REQUEST)
				.expect((response) => {
					expect(response.body).toHaveProperty('errors');
					expect(response.body.errors).toHaveProperty('content');
					expect(response.body.errors.content).toBe(`Path \`content\` is required.`);
				});
		});

		it('should return 400 for missing post id', async () => {
			await request(app)
				.post('/comments')
				.set(getAuthorizationHeader())
				.send({
					content: 'This is a test comment',
				})
				.expect(httpStatus.BAD_REQUEST)
				.expect((response) => {
					expect(response.text).toBe('Invalid post id "(empty)"');
				});
		});
	});
});
