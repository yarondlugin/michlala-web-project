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
