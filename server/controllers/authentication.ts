import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { userModel, User } from '../models/users';
import { generateTokens } from '../utils/auth';
import { Token } from '../utils/types';
import { appConfig } from '../utils/appConfig';

export const register = async (request: Request<{}, {}, Omit<User, '_id'>, {}>, response: Response, next: NextFunction) => {
	const { saltRounds } = appConfig;
	const { username, email, password } = request.body;

	try {
		const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });

		if (existingUser) {
			const conflictingDetails = {
				username: existingUser?.username === username,
				email: existingUser?.email === email,
			};

			response.status(httpStatus.BAD_REQUEST).json({
				message: 'User already exists with these details',
				conflictingDetails,
			});
			return;
		}

		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const creationResponse = await userModel.create({ username, email, password: hashedPassword });
		const { password: _password, refreshTokens, ...newUser } = creationResponse.toJSON();
		response.status(httpStatus.CREATED).send(newUser);
	} catch (error) {
		next(error);
	}
};

export const login = async (
	request: Request<{}, {}, Pick<User, 'username' | 'password'>, {}>,
	response: Response,
	next: NextFunction
) => {
	const { username, password } = request.body;
	try {
		const user = await userModel.findOne({ username });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			response.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
			return;
		}

		const { accessToken, refreshToken } = generateTokens(user._id.toString());
		user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
		await user.save();

		response.status(httpStatus.OK).json({ accessToken, refreshToken });
	} catch (error) {
		next(error);
	}
};

export const refresh = async (request: Request<{}, {}, { refreshToken: string }, {}>, response: Response, next: NextFunction) => {
	const {
		jwtOptions: { jwtSecret },
	} = appConfig;
	const { refreshToken } = request.body;

	if (!refreshToken) {
		response.status(httpStatus.BAD_REQUEST).json({ message: 'No token provided' });
		return;
	}

	try {
		const { userId, type } = jwt.verify(refreshToken, jwtSecret) as Token;
		if (type !== 'refresh') {
			response.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
			return;
		}

		const user = await userModel.findById(userId, { refreshTokens: true });
		if (!user || !user.refreshTokens?.includes(refreshToken)) {
			response.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
			return;
		}
		const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId);

		user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
		user.refreshTokens.push(newRefreshToken);
		await user.save();

		response.status(httpStatus.OK).json({ accessToken, refreshToken: newRefreshToken });
	} catch (error) {
		if (error instanceof jwt.TokenExpiredError) {
			response.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
			return;
		}
		if (error instanceof jwt.JsonWebTokenError || error instanceof SyntaxError) {
			response.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid token' });
			return;
		}

		next(error);
	}
};

export const logout = (_request: Request, response: Response) => {
	response.json({ message: 'Logged out successfully' });
};
