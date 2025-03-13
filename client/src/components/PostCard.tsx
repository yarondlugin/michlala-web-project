import { Card, Box, Typography, Avatar, Stack, SxProps, Tooltip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Post } from '../types/post';
import { ActionButton } from './ActionButton';
import ConfettiEffect from 'react-confetti';
import { useEffect, useRef, useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

type Props = {
    post: Post;
    sx?: SxProps;
};

export const PostCard = ({ post: { title, content, sender, isNew, senderDetails, isAI }, sx }: Props) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [componentLocation, setComponentLocation] = useState({ width: 0, height: 0, left: 0, top: 0 });
    const [isConfettiActive, setIsConfettiActive] = useState(isNew);

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
                    <Avatar sx={{ width: 48, height: 48, marginRight: 2 }} />
                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                            {title}
                        </Typography>
                        <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                            @{senderDetails?.[0]?.username || sender}
                        </Typography>
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
                    <ActionButton text='Like' hoverColor='error.main' icon={<FavoriteBorderIcon />} />
                </Stack>
            </Card>
        </>
    );
};
