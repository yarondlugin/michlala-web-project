import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Card, IconButton, Stack, SxProps, TextField, Typography } from '@mui/material';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import ConfettiEffect from 'react-confetti';
import { CONFETTI_DURATION } from '../consts';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { deleteCommentById, editCommentById } from '../queries/comments';
import { Comment, CommentBatchResponse } from '../types/comment';
import { DeletionModal } from './DeletionModal';
import { ProfilePicture } from './ProfilePicture';

type Props = {
    comment: Comment;
    sx?: SxProps;
};

export const CommentCard = ({ comment: { _id: commentId, content, isNew, senderDetails, sender, postId }, sx }: Props) => {
    const componentRef = useRef<HTMLDivElement>(null);
    const [componentLocation, setComponentLocation] = useState({ width: 0, height: 0, left: 0, top: 0 });
    const [isConfettiActive, setIsConfettiActive] = useState(isNew);

    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>(content);
    const [editError, setEditError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const cookieDetails = useRestrictedPage();
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
    }, [componentRef.current]);

    const queryClient = useQueryClient();
    const { mutate: editComment } = useMutation({
        mutationKey: ['editComment', commentId],
        mutationFn: (comment: Pick<Comment, '_id' | 'content'>) => editCommentById(comment),
        onMutate: async (editedComment) => {
            await queryClient.cancelQueries({ queryKey: ['comments', postId] });
            queryClient.setQueryData(['comments'], (oldData: InfiniteData<CommentBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        return {
                            ...page,
                            comments: page.comments.map((comment) =>
                                comment._id === editedComment._id ? { ...comment, content: editedComment.content } : comment,
                            ),
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
            queryClient.refetchQueries({ queryKey: ['comments', postId] });
        },
    });

    const { mutate: deleteComment } = useMutation({
        mutationKey: ['deleteComment', commentId],
        mutationFn: (commentId: string) => deleteCommentById(commentId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['comments', postId] });
            queryClient.setQueryData(['comments', postId], (oldData: InfiniteData<CommentBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        return {
                            ...page,
                            comments: page.comments.filter((comment) => comment._id !== commentId),
                        };
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setIsDeleteModalOpen(false);
        },
        onSettled: () => {
            setIsDeleteModalOpen(false);
            queryClient.refetchQueries({ queryKey: ['comments', postId] });
        },
    });

    const handleEnterEditMode = () => {
        setEditedContent(content);
        setIsEditMode(true);
    };

    const handleExitEditMode = () => {
        setEditedContent(content);
        setIsEditMode(false);
    };

    const handleEdit = () => {
        if (editedContent.length === 0) {
            setEditError("Content can't be empty");
            return;
        }
        setEditError(null);
        editComment({ _id: commentId, content: editedContent });
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
                    flexDirection: 'row',
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
                {/* Picture section */}
                <Box sx={{ display: 'flex', marginRight: '2%' }}>
                    <ProfilePicture
                        profilePictureURL={
                            senderDetails?.[0]?.profilePictureURL &&
                            `${import.meta.env.VITE_SERVER_URL}/${senderDetails[0].profilePictureURL}`
                        }
                    />
                </Box>

                {/* Content section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary', fontSize: '0.9rem', marginBottom: 1 }}>
                        @{senderDetails?.[0]?.username ?? 'username'}
                    </Typography>
                    {!isEditMode ? (
                        <Typography variant='body1' sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                            {content}
                        </Typography>
                    ) : (
                        <>
                            <TextField
                                multiline={true}
                                sx={{ width: '100%' }}
                                placeholder='Edit your comment'
                                value={editedContent}
                                onChange={(event) => setEditedContent(event.target.value)}
                            />
                            <Typography variant='body2' color='error'>
                                {editError ?? '‎' /*Invisible character so the error message is always rendered*/}
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Action buttons section */}
                {isEditable && !isNew && (
                    <Stack direction='row' sx={{ justifyContent: 'space-around', marginLeft: 'auto' }}>
                        {isEditMode ? (
                            <>
                                <IconButton onClick={handleExitEditMode} sx={{ height: 'fit-content' }}>
                                    <DoDisturbIcon />
                                </IconButton>
                                <IconButton onClick={handleEdit} sx={{ height: 'fit-content' }}>
                                    <CheckIcon />
                                </IconButton>
                            </>
                        ) : (
                            <>
                                <IconButton onClick={handleEnterEditMode} sx={{ height: 'fit-content' }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => setIsDeleteModalOpen(true)} sx={{ height: 'fit-content' }}>
                                    <DeleteIcon />
                                </IconButton>
                            </>
                        )}
                    </Stack>
                )}

                {/* Deletion modal */}
                <DeletionModal
                    isOpen={isDeleteModalOpen}
                    title='Delete this comment?'
                    description='This cannot be undone.'
                    onConfirm={() => deleteComment(commentId)}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            </Card>
        </>
    );
};
