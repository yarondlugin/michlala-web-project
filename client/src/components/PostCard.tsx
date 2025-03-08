import { Card, Box, Typography, Avatar, Stack, SxProps } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Post } from '../types/post';
import { ActionButton } from './ActionButton';

type Props = {
    post: Post;
    sx?: SxProps;
};

export const PostCard = ({ post: { title, content, sender }, sx }: Props) => {
    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 2,
                borderRadius: 3,
                boxShadow: 1,
                '&:hover': {
                    backgroundColor: '#3d3d3d',
                },
                transition: 'background-color 0.3s',
                ...sx,
            }}
        >
			{/* Title section */}
            <Box sx={{ display: 'flex' }}>
                <Avatar sx={{ width: 48, height: 48, marginRight: 2 }} />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                        @{sender}
                    </Typography>
                </Box>
            </Box>

            {/* Content section */}
            <Box sx={{ paddingLeft: 7, paddingY: 1 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {content}
                </Typography>
            </Box>

            {/* Action buttons section */}
            <Stack direction="row" sx={{ justifyContent: 'space-around', maxWidth: '20%' }}>
                <ActionButton text="Reply" icon={<ChatBubbleOutlineIcon />} />
                <ActionButton text="Like" hoverColor="error.main" icon={<FavoriteBorderIcon />} />
            </Stack>
        </Card>
    );
};
