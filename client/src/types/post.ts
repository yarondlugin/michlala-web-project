export type Post = {
    _id: string;
    title: string;
    content: string;
    sender: string;
};

export type PostBatchResponse = {
	posts: Post[];
	hasMore: boolean;
	lastId: string | null;
}