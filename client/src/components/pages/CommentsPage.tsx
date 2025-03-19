import { CircularProgress, Stack } from '@mui/material';
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError, HttpStatusCode } from 'axios';
import { useEffect, useMemo } from 'react';
import { fetchCommentsBatch } from '../../queries/comments';
import { fetchPostById } from '../../queries/posts';
import { CommentBatchResponse } from '../../types/comment';
import { Post } from '../../types/post';
import { CommentCard } from '../CommentCard';
import { ErrorCard } from '../ErrorCard';
import { NewCommentCard } from '../NewCommentCard';
import { PageBox } from '../PageBox';
import { PageTitle } from '../PageTitle';
import { PostCard } from '../PostCard';

type Props = {
    postId: string;
};

export const CommentsPage = ({ postId }: Props) => {
    const {
        data: post,
        isFetching: isFetchingPost,
        error: postError,
        isError: isPostError,
    } = useQuery<Post, AxiosError, Post, string[]>({
        queryKey: ['post', postId],
        queryFn: () => fetchPostById(postId),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: !!postId,
    });

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isError: isCommentsError,
    } = useInfiniteQuery<
        CommentBatchResponse,
        AxiosError,
        InfiniteData<CommentBatchResponse>,
        (string | {} | undefined)[],
        string | undefined
    >({
        queryKey: ['comments', postId],
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

    const errorComponent = useMemo(() => {
        if (postError?.status === HttpStatusCode.NotFound) {
            return (
                <ErrorCard
                    title={'Post not found'}
                    message={"We couldn't find the post you were looking for"}
                    showBackToFeedButton
                    sx={{ alignSelf: 'center' }}
                />
            );
        } else {
            return (
                <ErrorCard
                    title={'Something went wrong'}
                    message={`An error occured while getting the ${postError ? 'post' : 'comments'}, please try again`}
                    showBackToFeedButton
                    sx={{ alignSelf: 'center' }}
                />
            );
        }
    }, [postError, isCommentsError]);

    return (
        <PageBox>
            <PageTitle title='Comments' />
            {isFetchingPost && !isPostError ? (
                <CircularProgress size={200} />
            ) : post ? (
                <Stack direction='column' spacing={3} sx={{ width: '45%', alignItems: 'end' }}>
                    <PostCard post={post} sx={{ width: '100%' }} />
                    <NewCommentCard post={post} />
                    {isLoading && !isFetchingNextPage && <CircularProgress size={200} sx={{ alignSelf: 'center' }} />}
                    {data?.pages && commentsComponents}
                    {isCommentsError && errorComponent}
                    {isFetchingNextPage && <CircularProgress size={50} sx={{ alignSelf: 'center' }} />}
                </Stack>
            ) : (
                errorComponent
            )}
        </PageBox>
    );
};
