import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import httpStatus from 'http-status';
import { postsRouter } from './routes/posts';
import { commentsRouter } from './routes/comments';
import { usersRouter } from './routes/users';
import { startDB } from './services/db';
import { authorize } from './middlewares/authorization';
import { authenticationRouter } from './routes/authentication';
import { swagger } from './swagger';
import { appConfig } from './utils/appConfig';
import cors from 'cors';

dotenv.config();
const { port, nodeEnv, clientUrl } = appConfig;

export const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cors({
		origin: clientUrl,
	})
);

startDB();

app.get('/isAlive', (_request: Request, response: Response) => {
	response.status(httpStatus.OK).send('Server is alive!');
});

app.use('/auth', authenticationRouter);
app.use('/swagger', swagger.serve, swagger.setup);

app.use(authorize);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/users', usersRouter);

if (nodeEnv !== 'test') {
	app.listen(port, () => {
		console.log(`Server is running on port ${port}!`);
	});
}
