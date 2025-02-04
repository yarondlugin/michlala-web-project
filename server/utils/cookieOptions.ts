import { CookieOptions } from 'express';
import { appConfig } from './appConfig';

const getExpiryDate = (expirationInSeconds: number) => new Date(new Date().getTime() + expirationInSeconds * 1000);

const {
	jwtOptions: { accessTokenExpiration, refreshTokenExpiration },
} = appConfig;

const COOKIE_OPTIONS: CookieOptions = {
	secure: true,
	sameSite: 'none',
};

export const getAccessTokenCookieOptions: () => CookieOptions = () => ({
	...COOKIE_OPTIONS,
	expires: getExpiryDate(accessTokenExpiration),
});

export const getRefreshTokenCookieOptions: () => CookieOptions = () => ({
	...COOKIE_OPTIONS,
	expires: getExpiryDate(refreshTokenExpiration),
});
