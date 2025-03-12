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
	clientUrl: process.env.CLIENT_URL || 'https://localhost:5173',
	ssl: {
		keyPath: process.env.KEY_PATH || './localCerts/local.key',
		certPath: process.env.CERT_PATH || './localCerts/local.crt',
	},
	googleClient: {
		id: process.env.GOOGLE_CLIENT_ID || 'googleclientid',
		secret: process.env.GOOGLE_CLIENT_SECRET || 'googleclientsecret',
		userInfoApi: process.env.GOOGLE_USER_INFO_API || 'https://www.googleapis.com/oauth2/v3/userinfo',
	},
	aiClient: {
		apiUrl: process.env.AI_API_URL || 'aiApiUrl',
		apiKey: process.env.AI_API_KEY || 'apikey',
	},
	postGeneration:{
		batchAmount: process.env.POST_GENERATION_BATCH || 20,
		schedule: process.env.POST_GENERATION_SCHEDULE || '0 1 * * *',
	}
} as const;
