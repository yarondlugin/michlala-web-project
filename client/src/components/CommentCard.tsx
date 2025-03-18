import { Box, Card, SxProps, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ConfettiEffect from 'react-confetti';
import { Comment } from '../types/comment';
import { ProfilePicture } from './ProfilePicture';
import { CONFETTI_DURATION } from '../consts';

type Props = {
    comment: Comment;
    sx?: SxProps;
};

export const CommentCard = ({ comment: { content, sender, isNew, senderDetails }, sx }: Props) => {
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
            }, CONFETTI_DURATION);
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
                            senderDetails?.[0]?.profilePictureURL &&
                            `${import.meta.env.VITE_SERVER_URL}/${senderDetails[0].profilePictureURL}`
                        }
                        sx={{ marginRight: '2%' }}
                    />

                    <Box>
                        <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                            feaf
                        </Typography>

                        <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                            @{senderDetails?.[0]?.username || sender}
                        </Typography>
                    </Box>
                </Box>

                {/* Content section */}
                <Box sx={{ paddingLeft: 7, paddingY: 1 }}>
                    <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                        {content}
                    </Typography>
                </Box>
            </Card>
        </>
    );
};
