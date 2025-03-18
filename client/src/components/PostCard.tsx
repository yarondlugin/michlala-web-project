import DeleteIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Card, IconButton, Modal, Stack, SxProps, TextField, Tooltip, Typography } from '@mui/material';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConfettiEffect from 'react-confetti';
import { AI_PROFILE_PICTURE, CONFETTI_DURATION } from '../consts';
import { useLikePost } from '../hooks/useLikePost';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { editPostById } from '../queries/posts';
import { Post, PostBatchResponse } from '../types/post';
import { ActionButton } from './ActionButton';
import { ProfilePicture } from './ProfilePicture';

type Props = {
    post: Post;
    sx?: SxProps;
    onReply?: () => void | Promise<void>;
};

export const PostCard = ({
    post: { _id: postId, title, content, sender, isNew, senderDetails, isAI, likedUsers, commentsCount },
    sx,
    onReply,
}: Props) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [componentLocation, setComponentLocation] = useState({ width: 0, height: 0, left: 0, top: 0 });
    const [isConfettiActive, setIsConfettiActive] = useState(isNew);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState<string>(title);
    const [editedContent, setEditedContent] = useState<string | undefined>(content);
    const [editError, setEditError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const cookieDetails = useRestrictedPage();
    const { like, unlike } = useLikePost(postId);

    const isLiked = useMemo(() => !!cookieDetails && !!likedUsers?.includes(cookieDetails.userId), [likedUsers, cookieDetails]);
    const isEditable = useMemo(() => !!cookieDetails && cookieDetails.userId === sender, [sender, cookieDetails]);

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

    const queryClient = useQueryClient();
    const { mutate: editPost } = useMutation({
        mutationKey: ['editPost', postId],
        mutationFn: (post: Post) => editPostById(post),
        onMutate: async (editedPost) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post', postId] });

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        return {
                            ...page,
                            posts: page.posts.map((post) => (post._id === editedPost._id ? editedPost : post)),
                        };
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setEditError('Something went wrong, please try again');
        },
        onSettled: () => {
            handleExitEditMode();
            queryClient.refetchQueries({ queryKey: ['posts'] });
            queryClient.refetchQueries({ queryKey: ['post', postId] });
        },
    });

    const resetEditedValues = () => {
        setEditedTitle(title);
        setEditedContent(content);
    };

    const handleEnterEditMode = () => {
        resetEditedValues();
        setIsEditMode(true);
    };

    const handleExitEditMode = () => {
        resetEditedValues();
        setIsEditMode(false);
    };

    const handleEdit = () => {
        if (editedTitle.length === 0) {
            setEditError("Title can't be empty");
            return;
        }
        setEditError(null);

        editPost({
            _id: postId,
            sender,
            title: editedTitle,
            content: editedContent,
            commentsCount,
            isAI,
            isNew,
            likedUsers,
            senderDetails,
        });
    };

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

                    <Stack direction='column' sx={{ flexGrow: 1 }}>
                        {!isEditMode ? (
                            <Typography variant='h6' sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>
                        ) : (
                            <>
                                <TextField
                                    sx={{ width: '100%' }}
                                    placeholder='What shower thought did you have today?'
                                    value={editedTitle}
                                    onChange={(event) => setEditedTitle(event.target.value)}
                                />
                                <Typography variant='body2' color='error'>
                                    {editError ?? '‎' /*Invisible character so the error message is always rendered*/}
                                </Typography>
                            </>
                        )}
                        {!isAI && !isEditMode && (
                            <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                @{senderDetails?.[0]?.username || sender}
                            </Typography>
                        )}
                    </Stack>
                    {isAI && (
                        <Tooltip title='AI Generated Post' placement='top'>
                            <AutoAwesomeIcon sx={{ marginLeft: 'auto' }} />
                        </Tooltip>
                    )}
                    {isEditable &&
                        (isEditMode ? (
                            <Stack direction='row' sx={{ justifyContent: 'space-around', marginLeft: 'auto' }}>
                                <IconButton onClick={handleExitEditMode} sx={{ height: 'fit-content' }}>
                                    <DoDisturbIcon />
                                </IconButton>
                                <IconButton onClick={handleEdit} sx={{ height: 'fit-content' }}>
                                    <CheckIcon />
                                </IconButton>
                            </Stack>
                        ) : (
                            <Stack direction='row' sx={{ justifyContent: 'space-around', marginLeft: 'auto' }}>
                                <IconButton onClick={handleEnterEditMode} sx={{ height: 'fit-content' }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => setIsDeleteModalOpen(true)} sx={{ height: 'fit-content' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        ))}
                    {}
                </Box>

                {/* Content section */}
                <Box sx={{ paddingLeft: 7, paddingY: 1 }}>
                    {!isEditMode ? (
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap' }}>
                            {content}
                        </Typography>
                    ) : (
                        <TextField
                            multiline={true}
                            minRows={3}
                            sx={{ width: '100%', marginTop: 2 }}
                            placeholder='Care to elaborate? (optional)'
                            value={editedContent}
                            onChange={(event) => setEditedContent(event.target.value)}
                        />
                    )}
                </Box>

                {/* Action buttons section */}
                {!isEditMode && (
                    <Stack direction='row' sx={{ justifyContent: 'space-around', maxWidth: '20%' }}>
                        <ActionButton
                            text={commentsCount ? `${commentsCount} Replies` : 'Reply'}
                            icon={<ChatBubbleOutlineIcon />}
                            onClick={onReply}
                            sx={{ minWidth: 'fit-content' }}
                        />
                        <ActionButton
                            text={likedUsers?.length.toString() || '0'}
                            hoverColor='error.main'
                            onClick={() => (isLiked ? unlike() : like())}
                            icon={isLiked ? <FavoriteIcon color='error' /> : <FavoriteBorderIcon />}
                            sx={{ minWidth: 'fit-content' }}
                        />
                    </Stack>
                )}

                {/* Deletion modal */}
                <Modal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} disableScrollLock>
                    <Card
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 'min(500px, 50vw)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: 2,
                            borderRadius: 3,
                            boxShadow: 1,
                        }}
                    >
                        <Typography variant='h6' sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                            Delete this thought?
                        </Typography>
                        <Typography variant='body1' sx={{ marginBottom: 2 }}>
                            This cannot be undone, comments will be deleted as well.
                        </Typography>
                        <Typography variant='body1' sx={{ fontStyle: 'italic', marginBottom: 2 }}>
                            "{title}"
                        </Typography>
                        <Stack direction='row' sx={{ justifyContent: 'space-around' }}>
                            <ActionButton
                                text='Yes, delete'
                                icon={<CheckIcon />}
                                hoverColor='error.main'
                                onClick={() => {}}
                            />
                            <ActionButton
                                text='No, cancel'
                                hoverColor='text.primary'
                                onClick={() => setIsDeleteModalOpen(false)}
                                icon={<DoDisturbIcon />}
                            />
                        </Stack>
                    </Card>
                </Modal>
            </Card>
        </>
    );
};
