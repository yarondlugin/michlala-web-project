import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { isValidObjectId } from 'mongoose';
import { commentModel } from '../models/comments';
import { postModel } from '../models/posts';
import { AddUserIdToRequest } from '../utils/types';

export const createComment = async (request: Request, response: Response, next: NextFunction) => {
	const data = request.body;

	const { postId } = data;

	if (!postId || !isValidObjectId(postId)) {
		response.status(httpStatus.BAD_REQUEST).send(`Invalid post id "${postId || '(empty)'}"`);
		return;
	}
	const postExists = await postModel.exists({ _id: postId });
	if (!postExists) {
		response.status(httpStatus.BAD_REQUEST).send(`Post with id ${postId} doesn't exist`);
		return;
	}

	try {
		const newComment = await commentModel.create({ ...data, sender: (request as AddUserIdToRequest<Request>).userId });
		response.status(httpStatus.CREATED).send(newComment);
	} catch (error) {
		next(error);
	}
};

export const getComments = async (
	request: Request<{}, {}, {}, { sender?: string; postId?: string }>,
	response: Response,
	next: NextFunction
) => {
	const { postId } = request.query;

	if (!!postId && !isValidObjectId(postId)) {
		response.status(httpStatus.BAD_REQUEST).send(`Invalid post id "${postId}"`);
		return;
	}

	const filters = Object.entries(request.query)
		.filter(([key]) => Object.keys(commentModel.schema.obj).includes(key))
		.reduce((previous, [key, value]) => ({ ...previous, [key]: value }), {});

	try {
		const comments = await commentModel.find(filters);
		response.status(httpStatus.OK).send(comments);
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
