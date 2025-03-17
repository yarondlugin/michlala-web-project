require('dotenv').config();

module.exports = {
    apps: [
        {
            name: `client`,
			script: "pnpm",
      		args: "preview",
            env_production: {
                VITE_SERVER_URL: 'https://localhost:8080',
                VITE_GOOGLE_CLIENT_ID: '',
                VITE_POSTS_PER_PAGE: 20,
                NODE_ENV: 'production',
            },
        },
    ],
};