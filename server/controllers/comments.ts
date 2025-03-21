import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { FilterQuery, isValidObjectId, Types } from 'mongoose';
import { Comment, commentModel } from '../models/comments';
import { postModel } from '../models/posts';
import { appConfig } from '../utils/appConfig';
import { AddUserIdToRequest } from '../utils/types';

const validatePostId = async (postId: string): Promise<{ isValid: boolean; message: string, status: number }> => {
	if (!postId || !isValidObjectId(postId)) {
		return {
			isValid: false,
			message: `Invalid post id "${postId || '(empty)'}"`,
			status: httpStatus.BAD_REQUEST
		};
	}

	const postExists = await postModel.exists({ _id: postId });
	if (!postExists) {
		return {
			isValid: false,
			message: `Post with id ${postId} doesn't exist`,
			status: httpStatus.BAD_REQUEST
		};
	}

	return {
		isValid: true,
		message: 'valid postId',
		status: httpStatus.OK
	};
};

const validateCommentUpdate = async (userId: string, commentId: string): Promise<{ isValid: boolean; message: string, status: number }> => {
	if (!isValidObjectId(commentId)) {
		return {
			isValid: false,
			message: `Invalid comment id "${commentId || '(empty)'}"`,
			status: httpStatus.BAD_REQUEST
		};
	}

	const comment = await commentModel.findById({ _id: commentId });

	if (!comment) {
		return {
			isValid: false,
			message: `Comment with id ${commentId} doesn't exist`,
			status: httpStatus.NOT_FOUND
		};
	}

	if (comment.sender !== userId) {
		return {
			isValid: false,
			message: `Unauthorized update`,
			status: httpStatus.UNAUTHORIZED
		};
	}

	return {
		isValid: true,
		message: 'valid postId',
		status: httpStatus.OK
	};
};

export const createComment = async (request: Request<{}, {}, Partial<Comment>>, response: Response, next: NextFunction) => {
	const data = request.body;

	const { postId } = data;

	if (!data || data?.content?.length === 0) {
		response.status(httpStatus.BAD_REQUEST).send('Content cannot be empty');
		return;
	}

	try {
		const { isValid, message, status } = await validatePostId(postId?.toString() ?? '');

		if (!isValid) {
			response.status(status).send(message);
			return;
		}

		const newComment = await commentModel.create({
			...data,
			sender: new Types.ObjectId((request as AddUserIdToRequest<Request>).userId),
		});
		response.status(httpStatus.CREATED).send(newComment);
	} catch (error) {
		next(error);
	}
};

export const getAllComments = async (
	request: Request<{}, {}, {}, { postId: string; limit?: string; lastId?: string }>,
	response: Response,
	next: NextFunction
) => {
	const { maxCommentsBatch } = appConfig;
	
	const { postId, limit: limitParam, lastId } = request.query;
	const limit = Math.min(Number(limitParam) || maxCommentsBatch, maxCommentsBatch);
	try {
		const { isValid, message, status } = await validatePostId(postId);
		
		if (!isValid) {
			response.status(status).send(message);
			return;
		}
		
		const lastIdFilter: FilterQuery<Comment> = !!lastId ? { _id: { $lt: new Types.ObjectId(lastId) } } : {};
		const query: FilterQuery<Comment> = { ...lastIdFilter, postId: new Types.ObjectId(postId) };

		const comments = await commentModel.aggregate([
			{ $match: query },
			{
				$addFields: {
					objectIdSender: { $toObjectId: '$sender' },
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
			{ $project: { objectIdSender: 0 } },
			{ $sort: { _id: -1 } },
			{ $limit: limit ?? 0 },
		]);

		response.status(httpStatus.OK).send({
			comments,
			hasMore: comments.length === limit,
			lastId: comments.slice(-1)[0]?._id ?? null,
		});
	} catch (error) {
		next(error);
	}
};

export const getCommentById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { id: commentId } = request.params;

	if (!isValidObjectId(commentId)) {
		response.status(httpStatus.BAD_REQUEST).send(`Invalid id "${commentId}"`);
		return;
	}

	try {
		const comment = await commentModel.findById(commentId);

		if (!comment) {
			response.status(httpStatus.NOT_FOUND).send(`comment ${commentId} not found`);
			return;
		}

		response.status(httpStatus.OK).send(comment);
	} catch (error) {
		next(error);
	}
};

export const updateCommentById = async (
	request: Request<{ id: string }, {}, Pick<Comment, 'content'>>,
	response: Response,
	next: NextFunction
) => {
	const { userId } = request as AddUserIdToRequest<Request<{ id: string }>>;
	const { id: commentId } = request.params;
	const { content } = request.body;

	if (!content) {
		response.status(httpStatus.BAD_REQUEST).send('Content not provided');
		return;
	}

	try {
		const { isValid, message, status } = await validateCommentUpdate(userId, commentId);

		if (!isValid) {
			response.status(status).send(message);
			return;
		}

		await commentModel.updateOne({ _id: commentId }, { content });
		response.status(httpStatus.OK).send(`Comment ${commentId} updated`);
	} catch (error) {
		next(error);
	}
};

export const deleteCommentById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { userId } = request as AddUserIdToRequest<Request<{ id: string }>>;
	const { id: commentId } = request.params;

	try {
		const { isValid, message, status } = await validateCommentUpdate(userId, commentId);

		if (!isValid) {
			response.status(status).send(message);
			return;
		}

		await commentModel.findByIdAndDelete({ _id: commentId });
		response.status(httpStatus.OK).send(`comment ${commentId} deleted`);
	} catch (error) {
		next(error);
	}
};
