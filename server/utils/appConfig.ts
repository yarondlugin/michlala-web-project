const ONE_HOUR_IN_SECONDS = 60 * 60;

export const appConfig = {
	port: process.env.PORT || 8080,
	nodeEnv: process.env.NODE_ENV || 'localhost',
	jwtOptions: {
		jwtSecret: process.env.JWT_SECRET || 'jwtsecret',
		accessTokenExpiration: Number(process.env.ACCESS_TOKEN_EXPIRATION) || ONE_HOUR_IN_SECONDS,
		refreshTokenExpiration: Number(process.env.REFRESH_TOKEN_EXPIRATION) || ONE_HOUR_IN_SECONDS * 24,
	},
	dbURL: process.env.DB_URL || 'mongodb://localhost:27017/michlala',
	saltRounds: Number(process.env.SALT_ROUNDS) || 10,
	clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
} as const;
