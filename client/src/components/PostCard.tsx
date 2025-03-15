import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Card, Stack, SxProps, Tooltip, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConfettiEffect from 'react-confetti';
import { AI_PROFILE_PICTURE } from '../consts';
import { useLikePost } from '../hooks/useLikePost';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { Post } from '../types/post';
import { ActionButton } from './ActionButton';
import { ProfilePicture } from './ProfilePicture';

type Props = {
    post: Post;
    sx?: SxProps;
};

export const PostCard = ({ post: { _id: postId, title, content, sender, isNew, senderDetails, isAI, likedUsers }, sx }: Props) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [componentLocation, setComponentLocation] = useState({ width: 0, height: 0, left: 0, top: 0 });
    const [isConfettiActive, setIsConfettiActive] = useState(isNew);
    const cookieDetails = useRestrictedPage();
    const { like, unlike } = useLikePost(postId);

    const isLiked = useMemo(() => !!cookieDetails && !!likedUsers?.includes(cookieDetails.userId), [likedUsers, cookieDetails]);

    useEffect(() => {
        if (componentRef.current) {
            const { width, height, top, left } = componentRef.current.getBoundingClientRect();
            setComponentLocation({ width, height, left, top });
        }

        if (isConfettiActive) {
            setTimeout(() => {
                setIsConfettiActive(false);
            }, 4000);
        }
    }, []);

    return (
        <>
            {isConfettiActive && (
                <ConfettiEffect
                    height={componentLocation.height}
                    width={componentLocation.width}
                    style={{
                        position: 'absolute',
                        left: Number(componentLocation.left.toFixed()),
                        top: Number(componentLocation.top.toFixed()) + window.scrollY,
                    }}
                ></ConfettiEffect>
            )}
            <Card
                ref={componentRef}
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
                    <ProfilePicture
                        profilePictureURL={
                            isAI
                                ? AI_PROFILE_PICTURE
                                : senderDetails?.[0]?.profilePictureURL &&
                                  `${import.meta.env.VITE_SERVER_URL}/${senderDetails[0].profilePictureURL}`
                        }
                        sx={{ marginRight: '2%' }}
                    />

                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                        {!isAI && (
                            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                @{senderDetails?.[0]?.username || sender}
                            </Typography>
                        )}
                    </Box>
                    {isAI && (
                        <Tooltip title='AI Generated Post' placement='top'>
                            <AutoAwesomeIcon sx={{ marginLeft: 'auto' }} />
                        </Tooltip>
                    )}
                </Box>

                {/* Content section */}
                <Box sx={{ paddingLeft: 7, paddingY: 1 }}>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                        {content}
                    </Typography>
                </Box>

                {/* Action buttons section */}
                <Stack direction='row' sx={{ justifyContent: 'space-around', maxWidth: '20%' }}>
                    <ActionButton text='Reply' icon={<ChatBubbleOutlineIcon />} />
                    <ActionButton
                        text={likedUsers?.length.toString() || '0'}
                        hoverColor='error.main'
                        onClick={() => (isLiked ? unlike() : like())}
                        icon={isLiked ? <FavoriteIcon color='error' /> : <FavoriteBorderIcon />}
                    />
                </Stack>
            </Card>
        </>
    );
};
