import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { appConfig } from './appConfig';

const getRandom = () => crypto.randomBytes(64).toString('hex');

export const generateTokens = (userId: string) => {
	const {
		jwtOptions: { jwtSecret, accessTokenExpiration, refreshTokenExpiration },
	} = appConfig;

	const accessToken = jwt.sign({ type: 'access', userId, random: getRandom() }, jwtSecret, {
		expiresIn: accessTokenExpiration,
	});

	const refreshToken = jwt.sign({ type: 'refresh', userId, random: getRandom() }, jwtSecret, {
		expiresIn: refreshTokenExpiration,
	});

	return { accessToken, refreshToken };
};
