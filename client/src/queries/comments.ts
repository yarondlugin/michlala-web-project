import { Comment, CommentBatchResponse, NewComment } from '../types/comment';
import { axiosClient } from './axios';

export const fetchCommentsBatch = async (postId: string, limit: number, lastId?: string) => {
    const response = await axiosClient.get<CommentBatchResponse>(`/comments/?postId=${postId}&limit=${limit}${lastId ? `&lastId=${lastId}` : ''}`);
    return response.data;
};

export const createNewComment = async (comment: NewComment) => {
    const response = await axiosClient.post<Comment>(`/comments`, comment);
    return response.data;
};
