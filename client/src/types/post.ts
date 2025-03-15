export type Post = {
    _id: string;
    title: string;
    content?: string;
    sender: string;
    isNew?: boolean;
    senderDetails?: { username: string }[];
    isAI?: boolean;
};

export type PostBatchResponse = {
    posts: Post[];
    hasMore: boolean;
    lastId: string | null;
};

export type NewPost = Omit<Post, '_id' | 'sender'>;
