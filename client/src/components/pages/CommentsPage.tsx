import { CircularProgress, Stack } from '@mui/material';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { fetchCommentsBatch } from '../../queries/comments';
import { fetchPostById } from '../../queries/posts';
import { CommentBatchResponse } from '../../types/comment';
import { CommentCard } from '../CommentCard';
import { PageBox } from '../PageBox';
import { PageTitle } from '../PageTitle';
import { PostCard } from '../PostCard';
import { NewCommentCard } from '../NewCommentCard';

type Props = {
    postId: string;
};

export const CommentsPage = ({ postId }: Props) => {
    const { data: post, isFetching: isFetchingPost } = useQuery({
        queryKey: ['post', postId],
        queryFn: () => fetchPostById(postId),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!postId,
    });

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        CommentBatchResponse,
        AxiosError,
        InfiniteData<CommentBatchResponse>,
        (string | {} | undefined)[],
        string | undefined
    >({
        queryKey: ['comments', post],
        queryFn: ({ pageParam = '' }) => fetchCommentsBatch(post?._id ?? '', import.meta.env.VITE_COMMENTS_PER_PAGE, pageParam),
        getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.lastId : undefined),
        initialPageParam: undefined,
        refetchOnWindowFocus: false,
        enabled: !!post,
    });

    const commentsComponents = data?.pages.flatMap((page) =>
        page?.comments?.map((comment) => <CommentCard comment={comment} key={comment._id} sx={{ width: '95%' }} />),
    );

    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetchingNextPage) return;
        if (hasNextPage) fetchNextPage();
    };

    useEffect(() => {
        if (hasNextPage) {
            window.addEventListener('scroll', handleScroll);
        }
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasNextPage]);

    useEffect(() => {
        if (!!post) {
            fetchNextPage();
        }
    }, [post]);

    return (
        <PageBox>
            <PageTitle title='Comments' />
            {isFetchingPost || !post ? (
                <CircularProgress size={200} />
            ) : (
                <Stack direction='column' spacing={3} sx={{ width: '45%', alignItems: 'end' }}>
                    <PostCard post={post} sx={{ width: '100%' }} />
					<NewCommentCard post={post} />
                    {isLoading && !isFetchingNextPage ? <CircularProgress size={200} /> : commentsComponents}
                    {isFetchingNextPage && <CircularProgress size={50} />}
                </Stack>
            )}
        </PageBox>
    );
};
