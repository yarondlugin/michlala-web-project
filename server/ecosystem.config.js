require('dotenv').config();

module.exports = {
	apps: [
		{
			name: `server`,
			script: 'build/index.js',
		},
	],
};
