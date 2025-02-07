import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import httpStatus from 'http-status';
import https from 'https';
import { authorize } from './middlewares/authorization';
import { authenticationRouter } from './routes/authentication';
import { commentsRouter } from './routes/comments';
import { postsRouter } from './routes/posts';
import { usersRouter } from './routes/users';
import { startDB } from './services/db';
import { swagger } from './swagger';
import { appConfig } from './utils/appConfig';

dotenv.config();
const {
	port,
	nodeEnv,
	clientUrl,
	ssl: { certPath, keyPath },
} = appConfig;

export const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
	cors({
		credentials: true,
		origin: clientUrl,
	})
);
app.use(cookieParser());

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

const serverRunningCallback = () => console.log(`Server is running on port ${port}!`);
switch (nodeEnv) {
	case 'test':
		break;
	case 'localhost':
		https.createServer({ key: readFileSync(keyPath), cert: readFileSync(certPath) }, app).listen(port, serverRunningCallback);
		break;
	default:
		app.listen(port, serverRunningCallback);
		break;
}
