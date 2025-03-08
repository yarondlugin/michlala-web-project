import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../../queries/posts';
import { Box, CircularProgress } from '@mui/material';
import { PostCard } from '../PostCard';

export const FeedPage = () => {
    const { data, isFetching } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

    const postsComponents = data?.map((post) => <PostCard post={post} key={post._id} sx={{marginBottom:'2%'}} />);

    return isFetching ? (
        <CircularProgress size={200} />
    ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', placeItems: 'center', width: '45%', paddingTop: '5%' }}>{postsComponents}</Box>
    );
};
