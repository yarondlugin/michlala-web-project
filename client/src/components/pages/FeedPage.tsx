import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '../../queries/posts';
import { Card, CircularProgress, Typography } from '@mui/material';

export const FeedPage = () => {
    const { data, isFetching } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

    const postsComponents = data?.map(({ _id, title, content, sender }) => (
        <Card id={_id}>
            <Typography variant="h5">
                {sender} | {title}
            </Typography>
            <Typography variant="body1">{content}</Typography>
        </Card>
    ));

    return isFetching ? <CircularProgress size={200} /> : [postsComponents];
};
