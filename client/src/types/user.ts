export type User = {
    _id: string;
    email: string;
    username: string;
    profilePictureURL?: string;
};

export type EditUser = User & {
    newProfilePicture?: File;
};
