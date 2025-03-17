require('dotenv').config();

module.exports = {
	apps: [
		{
			name: `server`,
			script: "build/index.js",
			env_production: {
				NODE_ENV: "production",
				GOOGLE_CLIENT_ID: "",
				GOOGLE_CLIENT_SECRET: "",
				AI_API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash",
				AI_API_KEY: "",
				KEY_PATH: "server/localCerts/key.key",
				CERT_PATH: "server/localCerts/cert.crt",
				POST_GENERATION_BATCH: 50
			},
		},
	],
};