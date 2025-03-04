import { OAuth2Client } from 'google-auth-library';
import { appConfig } from '../utils/appConfig';

export interface GoogleUserInfoResponse {
	email: string;
	name: string;
	email_verified: boolean
}

export const googleOAuthClient = new OAuth2Client(appConfig.googleClient.id, appConfig.googleClient.secret, 'postmessage');
