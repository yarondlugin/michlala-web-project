import { Post, PostBatchResponse } from '../types/post';
import { axiosClient } from './axios';

export const fetchPosts = async () => {
    const response = await axiosClient.get<Post[]>(`/posts`);
    return response.data;
};

export const fetchPostsBatch = async (limit: number, lastId?: string) => {
    const response = await axiosClient.get<PostBatchResponse>(`/posts/?limit=${limit}${lastId ? `&lastId=${lastId}` : ''}`);
    return response.data;
};
