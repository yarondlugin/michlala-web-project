import { User } from './user';

export type Comment = {
    _id: string;
    content: string;
    sender: string;
    postId: string;
    isNew?: boolean;
    senderDetails?: User[];
};

export type CommentBatchResponse = {
    comments: Comment[];
    hasMore: boolean;
    lastId: string | null;
};

export type NewComment = Omit<Comment, '_id' | 'sender'>;
