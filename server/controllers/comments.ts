import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { FilterQuery, isValidObjectId, Types } from 'mongoose';
import { Comment, commentModel } from '../models/comments';
import { postModel } from '../models/posts';
import { appConfig } from '../utils/appConfig';
import { AddUserIdToRequest } from '../utils/types';

const validatePostId = async (postId: string): Promise<{ isValid: boolean; message: string }> => {
	if (!postId || !isValidObjectId(postId)) {
		return {
			isValid: false,
			message: `Invalid post id "${postId || '(empty)'}"`,
		};
	}

	const postExists = await postModel.exists({ _id: postId });
	if (!postExists) {
		return {
			isValid: false,
			message: `Post with id ${postId} doesn't exist`,
		};
	}

	return {
		isValid: true,
		message: 'valid postId',
	};
};

export const createComment = async (request: Request<{}, {}, Comment>, response: Response, next: NextFunction) => {
	const data = request.body;

	const { postId } = data;

	if (!data || data?.content?.length === 0) {
		response.status(httpStatus.BAD_REQUEST).send('Content cannot be empty');
		return;
	}

	try {
		const { isValid, message } = await validatePostId(postId.toString());

		if (!isValid) {
			response.status(httpStatus.BAD_REQUEST).send(message);
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

	const lastIdFilter: FilterQuery<Comment> = !!lastId ? { _id: { $lt: new Types.ObjectId(lastId) } } : {};
	const query: FilterQuery<Comment> = { ...lastIdFilter, postId: new Types.ObjectId(postId) };

	try {
		const { isValid, message } = await validatePostId(postId);

		if (!isValid) {
			response.status(httpStatus.BAD_REQUEST).send(message);
			return;
		}

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

export const updateCommentById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { id: commentId } = request.params;
	const { sender, ...data } = request.body;

	if (!isValidObjectId(commentId)) {
		response.status(httpStatus.BAD_REQUEST).send(`Invalid id "${commentId}"`);
		return;
	}
	if (Object.keys(data || {}).length === 0) {
		response.status(httpStatus.BAD_REQUEST).send('No update fields provided');
		return;
	}

	try {
		const updateResponse = await commentModel.updateOne({ _id: commentId }, data);

		if (updateResponse.matchedCount === 0) {
			response.status(httpStatus.NOT_FOUND).send(`Comment with id ${commentId} not found`);
			return;
		}

		response.status(httpStatus.OK).send(`Comment ${commentId} updated`);
	} catch (error) {
		next(error);
	}
};

export const deleteCommentById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	const { id: commentId } = request.params;

	if (!isValidObjectId(commentId)) {
		response.status(httpStatus.BAD_REQUEST).send(`Invalid id "${commentId}"`);
		return;
	}

	try {
		const deleteResponse = await commentModel.findByIdAndDelete({ _id: commentId });
		if (deleteResponse === null) {
			response.status(httpStatus.NOT_FOUND).send(`Comment with id ${commentId} not found`);
			return;
		}
		response.status(httpStatus.OK).send(`comment ${commentId} deleted`);
	} catch (error) {
		next(error);
	}
};
