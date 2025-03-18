import { NewPost, Post, PostBatchResponse } from '../types/post';
import { axiosClient } from './axios';

export const fetchPostsBatch = async (limit: number, lastId?: string, sender?: string) => {
    const response = await axiosClient.get<PostBatchResponse>(
        `/posts/?limit=${limit}${lastId ? `&lastId=${lastId}` : ''}${sender ? `&sender=${sender}` : ''}`,
    );
    return response.data;
};

export const fetchPostById = async (id: string) => {
    const response = await axiosClient.get<Post>(`/posts/${id}`);
    return response.data;
};

export const createNewPost = async (post: NewPost) => {
    const response = await axiosClient.post<Post>(`/posts`, post);
    return response.data;
};

export const editPostById = async (post: Post) => {
    const response = await axiosClient.put<Post>(`/posts/${post._id}`, post);
    return response.data;
};

export const likePost = async (postId: string) => {
    const response = await axiosClient.put(`/posts/like/${postId}`);
    return response.data;
};

export const unlikePost = async (postId: string) => {
    const response = await axiosClient.put(`/posts/unlike/${postId}`);
    return response.data;
};

export const deletePostById = async (postId: string) => {
    const response = await axiosClient.delete<string>(`/posts/${postId}`);
    return response.data;
};
