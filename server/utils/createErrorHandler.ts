import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import httpStatus from 'http-status';
import { formatValidationError } from './formatValidationError';

export const NOT_AN_IMAGE_ERROR = 'Please upload an image';

export const createErrorHandler =
	(entityName: string): ErrorRequestHandler =>
	(error: Error, request: Request, response: Response, _next: NextFunction) => {
		if (error.name === 'ValidationError') {
			response.status(httpStatus.BAD_REQUEST).send(formatValidationError(error));
			return;
		}
		if (error.message === NOT_AN_IMAGE_ERROR) {
			response.status(httpStatus.BAD_REQUEST).send(error.message);
			return;
		}

		console.error(`An error occured in ${entityName} router at ${request.method} ${request.url} - ${error.message}`);
		response.status(httpStatus.INTERNAL_SERVER_ERROR).send('Internal server error');
	};
