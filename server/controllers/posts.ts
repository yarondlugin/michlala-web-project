import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { Post, postModel } from '../models/posts';
import { AddUserIdToRequest } from '../utils/types';

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
	try {
		const { sender, limit: limitParam, lastId } = request.query;
		const limit = Number(limitParam) || 0;

		const lastIdFilter: FilterQuery<Post> = !!lastId ? { _id: { $lt: lastId } } : {};
		const senderFilter: FilterQuery<Post> = !!sender ? { sender } : {};

		const query: FilterQuery<Post> = {
			...lastIdFilter,
			...senderFilter,
		};

		const posts = await postModel
			.find(query)
			.sort({ _id: -1 })
			.limit(limit ?? 0);

		response.status(httpStatus.OK).send({
			posts,
			hasMore: posts.length === limit,
			lastId: posts.length ? posts[posts.length - 1]._id : null,
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
