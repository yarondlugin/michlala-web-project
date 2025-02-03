import { axiosClient } from './axios';

export const fetchIsAlive = async () => {
    const response = await axiosClient.get('/isAlive');
    return response.data;
};
