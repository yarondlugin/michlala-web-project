import { Post } from '../types/post';
import { axiosClient } from './axios';

export const fetchPosts = async () => {
    const response = await axiosClient.get<Post[]>(`/posts`);
    return response.data;
};
