import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../../queries/posts';
import { CircularProgress, Stack } from '@mui/material';
import { PostCard } from '../PostCard';
import { PageTitle } from '../PageTitle';
import { PageBox } from '../PageBox';

export const FeedPage = () => {
    const { data, isFetching } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

    const postsComponents = data?.map((post) => <PostCard post={post} key={post._id} />);

    return (
        <PageBox>
            <PageTitle title='Thoughts' />
            <Stack direction='column' spacing={3} sx={{ width: '45%' }}>
                {isFetching ? <CircularProgress size={200} /> : [postsComponents]}
            </Stack>
        </PageBox>
    );
};
