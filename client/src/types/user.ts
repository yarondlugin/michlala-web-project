export enum userTypes {
	PASSWORD = 'PASSWORD',
	GOOGLE = 'GOOGLE',
};

export type User = {
    _id: string;
    email: string;
    username: string;
	type: userTypes
};
