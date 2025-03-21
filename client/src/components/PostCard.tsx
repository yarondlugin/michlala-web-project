import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import EditIcon from '@mui/icons-material/Edit';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Card, IconButton, Stack, SxProps, TextField, Tooltip, Typography } from '@mui/material';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConfettiEffect from 'react-confetti';
import { AI_PROFILE_PICTURE, CONFETTI_DURATION } from '../consts';
import { useLikePost } from '../hooks/useLikePost';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { deletePostById, editPostById, updatePostImageById } from '../queries/posts';
import { Post, PostBatchResponse } from '../types/post';
import { ActionButton } from './ActionButton';
import { DeletionModal } from './DeletionModal';
import PostImage from './PostImage';
import { ProfilePicture } from './ProfilePicture';

type Props = {
    post: Post;
    sx?: SxProps;
    onReply?: () => void | Promise<void>;
};

export const PostCard = ({
    post: { _id: postId, title, content, sender, isNew, senderDetails, isAI, likedUsers, commentsCount, imageURI },
    sx,
    onReply,
}: Props) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [componentLocation, setComponentLocation] = useState({ width: 0, height: 0, left: 0, top: 0 });
    const [isConfettiActive, setIsConfettiActive] = useState(isNew);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editedTitle, setEditedTitle] = useState<string>(title);
    const [editedContent, setEditedContent] = useState<string | undefined>(content);
    const [editedImage, setEditedImage] = useState<File | undefined | null>();
    const [editError, setEditError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation();

    const cookieDetails = useRestrictedPage();
    const { like, unlike } = useLikePost(postId);

    const isLiked = useMemo(() => !!cookieDetails && !!likedUsers?.includes(cookieDetails.userId), [likedUsers, cookieDetails]);
    const isEditable = useMemo(() => !!cookieDetails && cookieDetails.userId === sender, [sender, cookieDetails]);

    const postImageSrc = useMemo(() => {
        if (editedImage) {
            return URL.createObjectURL(editedImage);
        }

        if (editedImage === null) {
            return null;
        }

        if (isNew) {
            return imageURI;
        }

        if (imageURI) {
            return `${import.meta.env.VITE_SERVER_URL}/${imageURI}?ts=${Date.now()}`;
        }
    }, [editedImage, isEditMode, imageURI]);

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
        mutationFn: (post: Pick<Post, '_id' | 'title' | 'content' | 'imageURI'>) => editPostById(post),
        onMutate: async (editedPost) => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post', postId] });

            if (editedImage) {
                await updatePostImageById(postId, editedImage);
            }

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        return {
                            ...page,
                            posts: page.posts.map((currentPost) => (currentPost._id === editedPost._id ? editedPost : currentPost)),
                        };
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setEditError('Something went wrong, please try again');
        },
        onSettled: async () => {
            handleExitEditMode();
            await queryClient.refetchQueries({ queryKey: ['posts'] });
            await queryClient.refetchQueries({ queryKey: ['post', postId] });
        },
    });

    const resetEditedValues = () => {
        setEditedTitle(title);
        setEditedContent(content);
        setEditedImage(undefined);
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

        const deleteImage = imageURI && editedImage === null ? { imageURI: null } : {};

        editPost({
            _id: postId,
            title: editedTitle,
            content: editedContent,
            ...deleteImage,
        });
    };

    const { mutate: deletePost } = useMutation({
        mutationKey: ['deletePost', postId],
        mutationFn: (postId: string) => deletePostById(postId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post', postId] });

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        return {
                            ...page,
                            posts: page.posts.filter((post) => post._id !== postId),
                        };
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setIsDeleteModalOpen(false);
        },
        onSettled: async () => {
            setIsDeleteModalOpen(false);
            await queryClient.refetchQueries({ queryKey: ['posts'] });
            await queryClient.refetchQueries({ queryKey: ['post', postId] });
            if (location.pathname.startsWith('/comments')) {
                navigate({ to: '/feed' });
            }
        },
    });

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
                                  `${import.meta.env.VITE_SERVER_URL}/${senderDetails[0].profilePictureURL}?ts=${Date.now()}`
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
                                @{senderDetails?.[0]?.username || 'username'}
                            </Typography>
                        )}
                    </Stack>

                    {isAI && (
                        <Tooltip title='AI Generated Post' placement='top'>
                            <AutoAwesomeIcon sx={{ marginLeft: 'auto' }} />
                        </Tooltip>
                    )}

                    {isEditable &&
                        !isNew &&
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
                </Box>

                {/* Content section */}
                <Stack direction='row' spacing={2} sx={{ paddingLeft: 7, paddingY: 1, justifyContent: 'space-between' }}>
                    {!isEditMode ? (
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', flexGrow: 1 }}>
                            {content}
                        </Typography>
                    ) : (
                        <TextField
                            multiline={true}
                            minRows={3}
                            sx={{ marginTop: 2, flexGrow: 1 }}
                            placeholder='Care to elaborate? (optional)'
                            value={editedContent}
                            onChange={(event) => setEditedContent(event.target.value)}
                        />
                    )}
                    {(imageURI || isEditMode) && (
                        <PostImage imageURI={postImageSrc} size={200} isEditing={isEditMode} onUpload={(file) => setEditedImage(file)} />
                    )}
                </Stack>

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
                <DeletionModal
                    isOpen={isDeleteModalOpen}
                    title='Delete this thought?'
                    description='This cannot be undone, comments will be deleted as well.'
                    note={`"${title}"`}
                    onConfirm={() => deletePost(postId)}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            </Card>
        </>
    );
};
