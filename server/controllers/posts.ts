import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { FilterQuery, isValidObjectId, Types } from 'mongoose';
import { Post, postModel } from '../models/posts';
import { User } from '../models/users';
import { appConfig } from '../utils/appConfig';
import { AddUserIdToRequest } from '../utils/types';
import { commentModel } from '../models/comments';

const validatePostUpdate = async (
	userId: string,
	postId: string,
	skipAuthCheck?: boolean
): Promise<{ isValid: boolean; message: string }> => {
	if (!isValidObjectId(postId)) {
		return {
			isValid: false,
			message: `Invalid post id "${postId || '(empty)'}"`,
		};
	}

	const post = await postModel.findById({ _id: postId });

	if (!post) {
		return {
			isValid: false,
			message: `Post with id ${postId} doesn't exist`,
		};
	}

	if (post.sender !== userId && !skipAuthCheck) {
		return {
			isValid: false,
			message: `Unauthorized update`,
		};
	}

	return {
		isValid: true,
		message: 'valid postId',
	};
};

export const createPost = async (request: Request<{}, {}, Post>, response: Response, next: NextFunction) => {
	const postBody = request.body;
	const userId = (request as AddUserIdToRequest<Request>).userId;

	if (!isValidObjectId(userId)) {
		response.status(httpStatus.BAD_REQUEST).send(`Invalid sender id ${userId}`);
		return;
	}

	try {
		const post = await postModel.create({ ...postBody, sender: new Types.ObjectId(userId) });
		response.status(httpStatus.CREATED).send(post);
	} catch (error) {
		next(error);
	}
};

export const getAllPosts = async (
	request: Request<{}, {}, {}, { sender?: string; limit?: string; lastId?: string }>,
	response: Response,
	next: NextFunction
) => {
	const { maxPostsBatch } = appConfig;

	const { sender, limit: limitParam, lastId } = request.query;
	const limit = Math.min(Number(limitParam) || maxPostsBatch, maxPostsBatch);

	const lastIdFilter: FilterQuery<Post> = !!lastId ? { _id: { $lt: new Types.ObjectId(lastId) } } : {};
	const senderFilter: FilterQuery<Post> = !!sender ? { sender } : {};
	const query: FilterQuery<Post> = { ...lastIdFilter, ...senderFilter };

	try {
		const posts = await postModel.aggregate([
			{ $match: query },
			{
				$addFields: {
					objectIdSender: { $cond: [{ $eq: ['$isAI', true] }, '', { $toObjectId: '$sender' }] },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'objectIdSender',
					foreignField: '_id',
					pipeline: [{ $project: { password: 0, refreshTokens: 0 } }],
					as: 'senderDetails',
				},
			},
			{
				$lookup: {
					from: 'comments',
					localField: '_id',
					foreignField: 'postId',
					as: 'comments',
				},
			},
			{
				$addFields: {
					commentsCount: { $size: '$comments' },
				},
			},
			{ $project: { objectIdSender: 0, comments: 0 } },
			{ $sort: { _id: -1 } },
			{ $limit: limit ?? 0 },
		]);

		response.status(httpStatus.OK).send({
			posts,
			hasMore: posts.length === limit,
			lastId: posts.slice(-1)[0]?._id ?? null,
		});
	} catch (error) {
		next(error);
	}
};

export const getPostById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { id: postId } = request.params;

	if (!isValidObjectId(postId)) {
		response.status(httpStatus.BAD_REQUEST).send('Invalid id');
		return;
	}

	const idFilter: FilterQuery<Post> = { _id: new Types.ObjectId(postId) };

	try {
		const result = await postModel.aggregate<Post | { senderDetails?: User }>([
			{ $match: idFilter },
			{
				$addFields: {
					objectIdSender: { $cond: [{ $eq: ['$isAI', true] }, '', { $toObjectId: '$sender' }] },
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'objectIdSender',
					foreignField: '_id',
					pipeline: [{ $project: { password: 0, refreshTokens: 0 } }],
					as: 'senderDetails',
				},
			},
			{
				$lookup: {
					from: 'comments',
					localField: '_id',
					foreignField: 'postId',
					as: 'comments',
				},
			},
			{
				$addFields: {
					commentsCount: { $size: '$comments' },
				},
			},
			{ $project: { objectIdSender: 0, comments: 0 } },
		]);

		const post = result[0];

		if (!post) {
			response.status(httpStatus.NOT_FOUND).send(`Post with id ${postId} not found`);
			return;
		}

		response.status(httpStatus.OK).send(post);
	} catch (error) {
		next(error);
	}
};

export const updatePostById = async (request: Request<{ id: string }, {}, Post>, response: Response, next: NextFunction) => {
	const { userId } = request as AddUserIdToRequest<Request<{ id: string }>>;
	const { id: postId } = request.params;
	const { _id, sender, ...updatedPost } = request.body;

	try {
		const { isValid, message } = await validatePostUpdate(userId, postId);

		if (!isValid) {
			response.status(httpStatus.BAD_REQUEST).send(message);
			return;
		}

		await postModel.updateOne({ _id: postId }, updatedPost);

		response.status(httpStatus.OK).send('Updated successfully');
	} catch (error) {
		next(error);
	}
};

export const likePostById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { userId } = request as AddUserIdToRequest<Request<{ id: string }>>;
	const { id: postId } = request.params;

	try {
		const { isValid, message } = await validatePostUpdate(userId, postId, true);

		if (!isValid) {
			response.status(httpStatus.BAD_REQUEST).send(message);
			return;
		}

		await postModel.updateOne({ _id: postId }, { $addToSet: { likedUsers: userId } });

		response.status(httpStatus.OK).send('Liked successfully');
	} catch (error) {
		next(error);
	}
};

export const unlikePostById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { userId } = request as AddUserIdToRequest<Request<{ id: string }>>;
	const { id: postId } = request.params;

	try {
		const { isValid, message } = await validatePostUpdate(userId, postId, true);

		if (!isValid) {
			response.status(httpStatus.BAD_REQUEST).send(message);
			return;
		}

		await postModel.updateOne({ _id: postId }, { $pull: { likedUsers: userId } });

		response.status(httpStatus.OK).send('Unliked successfully');
	} catch (error) {
		next(error);
	}
};

export const deletePostById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { userId } = request as AddUserIdToRequest<Request<{ id: string }>>;
	const { id: postId } = request.params;

	try {
		const { isValid, message } = await validatePostUpdate(userId, postId);

		if (!isValid) {
			response.status(httpStatus.BAD_REQUEST).send(message);
			return;
		}

		await commentModel.deleteMany({ postId });
		await postModel.findByIdAndDelete({ _id: postId });
		response.status(httpStatus.OK).send(`Post ${postId} deleted`);
	} catch (error) {
		next(error);
	}
};
