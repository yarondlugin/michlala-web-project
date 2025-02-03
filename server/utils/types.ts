import { Request } from 'express';

export type TypeWithId<T> = T & { _id: string };

export type Token = {
	type: 'access' | 'refresh';
	userId: string;
};

export type AddUserIdToRequest<RequestType extends Request> = RequestType & { userId: string };
