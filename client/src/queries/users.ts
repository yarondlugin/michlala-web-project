import { User } from '../types/user';
import { axiosClient } from './axios';

export const fetchUserById = async (userId: string) => {
    const response = await axiosClient.get<User>(`/users/${userId}`);
    return response.data;
};

export const updateUserById = async (userId: string, data: Partial<User>) => {
    const response = await axiosClient.put(`/users/${userId}`, data);
    return response.data;
};

export const updateUserProfilePictureById = async (userId: string, profilePicture: File) => {
    const formData = new FormData();
    const fileName = profilePicture.name;
    const file = new File([profilePicture], fileName, { type: 'image/png' });
    formData.append('profilePicture', file, fileName);

    const response = await axiosClient.put(`/users/${userId}/profilePicture`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};
