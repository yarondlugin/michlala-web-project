require('dotenv').config();

module.exports = {
    apps: [
        {
            name: `client`,
            script: 'pnpm',
            args: 'preview',
        },
    ],
};
