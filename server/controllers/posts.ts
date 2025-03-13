import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { FilterQuery, isValidObjectId, Types } from 'mongoose';
import { Post, postModel } from '../models/posts';
import { AddUserIdToRequest } from '../utils/types';
import { appConfig } from '../utils/appConfig';

export const createPost = async (request: Request, response: Response, next: NextFunction) => {
	const postBody = request.body;

	try {
		const post = await postModel.create({ ...postBody, sender: (request as AddUserIdToRequest<Request>).userId });
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
					as: 'senderDetails',
				},
			},
			{ $project: { objectIdSender: 0 } },
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

	try {
		const post = await postModel.findById(postId);
		if (!post) {
			response.status(httpStatus.NOT_FOUND).send(`Post with id ${postId} not found`);
			return;
		}

		response.status(httpStatus.OK).send(post);
	} catch (error) {
		next(error);
	}
};

export const updatePostById = async (request: Request<{ id: string }>, response: Response, next: NextFunction) => {
	try {
		const { id: postId } = request.params;

		if (!isValidObjectId(postId)) {
			response.status(httpStatus.BAD_REQUEST).send('Invalid id');
			return;
		}

		const { sender, ...updatedPost } = request.body;
		const updateResponse = await postModel.updateOne({ _id: postId }, updatedPost);
		if (updateResponse.matchedCount === 0) {
			response.status(httpStatus.NOT_FOUND).send(`Post with id ${postId} not found`);
			return;
		}

		response.status(httpStatus.OK).send('Updated successfully');
	} catch (error) {
		next(error);
	}
};
