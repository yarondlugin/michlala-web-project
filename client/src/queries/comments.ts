import { Comment, CommentBatchResponse, NewComment } from '../types/comment';
import { axiosClient } from './axios';

export const fetchCommentsBatch = async (postId: string, limit: number, lastId?: string) => {
    const response = await axiosClient.get<CommentBatchResponse>(
        `/comments/?postId=${postId}&limit=${limit}${lastId ? `&lastId=${lastId}` : ''}`,
    );
    return response.data;
};

export const createNewComment = async (comment: NewComment) => {
    const response = await axiosClient.post<Comment>(`/comments`, comment);
    return response.data;
};

export const editCommentById = async (comment: Pick<Comment, '_id' | 'content'>) => {
    const response = await axiosClient.put<Comment>(`/comments/${comment._id}`, { content: comment.content });
    return response.data;
};

export const deleteCommentById = async (commentId: string) => {
    const response = await axiosClient.delete<string>(`/comments/${commentId}`);
    return response.data;
};
