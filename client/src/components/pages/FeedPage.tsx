import { useEffect } from 'react';
import { CircularProgress, Stack } from '@mui/material';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { fetchPostsBatch } from '../../queries/posts';
import { PostCard } from '../PostCard';
import { PageTitle } from '../PageTitle';
import { PageBox } from '../PageBox';
import { PostBatchResponse } from '../../types/post';

export const FeedPage = () => {
    const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        PostBatchResponse,
        AxiosError,
        InfiniteData<PostBatchResponse>,
        [string],
        string | undefined
    >({
        queryKey: ['posts'],
        queryFn: ({ pageParam = '' }) => fetchPostsBatch(import.meta.env.VITE_POSTS_PER_PAGE, pageParam),
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.lastId : undefined),
        initialPageParam: undefined,
    });

    const postsComponents = data?.pages.flatMap((page) =>
        page.posts.map((post) => <PostCard post={post} key={post._id} sx={{ width: '100%' }} />),
    );

	const handleScroll = () => {
		if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetchingNextPage)
			return;
		if (hasNextPage) fetchNextPage();
	};

    useEffect(() => {
		if (hasNextPage) {
			window.addEventListener('scroll', handleScroll);
		}
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasNextPage]);

    return (
        <PageBox>
            <PageTitle title='Thoughts' />
            <Stack direction='column' spacing={3} sx={{ width: '45%', alignItems: 'center' }}>
                {isFetching && !isFetchingNextPage ? <CircularProgress size={200} /> : postsComponents}
                {isFetchingNextPage && <CircularProgress size={50} />}
            </Stack>
        </PageBox>
    );
};
