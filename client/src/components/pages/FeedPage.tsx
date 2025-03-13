import { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Modal, Stack } from '@mui/material';
import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { fetchPostsBatch } from '../../queries/posts';
import { PostCard } from '../PostCard';
import { PageTitle } from '../PageTitle';
import { PageBox } from '../PageBox';
import { PostBatchResponse } from '../../types/post';
import { NewPostCard } from '../NewPostCard';
import AddIcon from '@mui/icons-material/Add';

export const FeedPage = () => {
    const [isNewPostOpen, setIsNewPostOpen] = useState(false);
    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
        PostBatchResponse,
        AxiosError,
        InfiniteData<PostBatchResponse>,
        [string],
        string | undefined
    >({
        queryKey: ['posts'],
        queryFn: ({ pageParam = '' }) => fetchPostsBatch(import.meta.env.VITE_POSTS_PER_PAGE, pageParam),
        getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.lastId : undefined),
        initialPageParam: undefined,
        refetchOnWindowFocus: false,
    });

    const postsComponents = data?.pages.flatMap((page) =>
        page?.posts.map((post) => <PostCard post={post} key={post._id} sx={{ width: '100%' }} />),
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

    return (
        <PageBox>
            <PageTitle title='Thoughts' />
            <Stack direction='column' spacing={3} sx={{ width: '45%', alignItems: 'center' }}>
                <NewPostCard />
                {isLoading && !isFetchingNextPage ? <CircularProgress size={200} /> : postsComponents}
                {isFetchingNextPage && <CircularProgress size={50} />}
            </Stack>
            <Modal open={isNewPostOpen} onClose={() => setIsNewPostOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'min(500px, 50vw)',
                    }}
                >
                    <NewPostCard
                        onPost={() => {
                            setIsNewPostOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    />
                </Box>
            </Modal>
            <IconButton
                onClick={() => setIsNewPostOpen(true)}
                size='large'
                sx={{
                    height: 'max(4vw, 100px)',
                    width: 'max(4vw, 100px)',
                    position: 'fixed',
                    right: '10vw',
                    bottom: '5vh',
                    backgroundColor: '#066196',
                    '&:hover': {
                        backgroundColor: '#078ddb',
                    },
                }}
            >
                <AddIcon sx={{ height: 'max(2.5vw, 60px)', width: 'max(2.5vw, 60px)' }} />
            </IconButton>
        </PageBox>
    );
};
