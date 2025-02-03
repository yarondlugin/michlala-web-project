import mongoose from 'mongoose';
import { appConfig } from '../utils/appConfig';

export const startDB = () => {
	const { dbURL } = appConfig;

	mongoose.connect(dbURL);
	const db = mongoose.connection;
	db.on('error', (error) => console.error(error));
	db.once('open', () => console.log('Connected to mongo database'));
};

export const closeDB = async () => {
	await mongoose.connection.close();
};
