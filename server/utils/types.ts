import { Request } from 'express';
import { Types } from 'mongoose';

export type TypeWithId<T> = T & { _id: Types.ObjectId };

export type Token = {
	type: 'access' | 'refresh';
	userId: string;
};

export type AddUserIdToRequest<RequestType extends Request> = RequestType & { userId: string };
