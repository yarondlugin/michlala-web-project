import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CONFETTI_DURATION } from '../consts';
import { useMyDetails } from '../hooks/useMyDetails';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { createNewComment } from '../queries/comments';
import { CommentBatchResponse } from '../types/comment';
import { Post } from '../types/post';
import { ActionButton } from './ActionButton';
import { ProfilePicture } from './ProfilePicture';

type Props = {
    onComment?: () => void;
    post: Post;
};

export const NewCommentCard = ({ onComment, post }: Props) => {
    const cookieDetails = useRestrictedPage();
    const myDetails = useMyDetails(cookieDetails?.userId);

    const [newCommentError, setNewCommentError] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState<string>('');
    const queryClient = useQueryClient();
    const { mutate: createComment } = useMutation({
        mutationKey: ['newComment'],
        mutationFn: (content: string) => createNewComment({ content, postId: post._id }),
        onMutate: async (content) => {
            onComment?.();
            await queryClient.cancelQueries({ queryKey: ['comments', post._id] });
            await queryClient.cancelQueries({ queryKey: ['post', post._id] });

            queryClient.setQueryData(['comments', post._id], (oldData: InfiniteData<CommentBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages?.map((page, index) => {
                        if (index !== 0) {
                            return page;
                        }

                        return {
                            ...page,
                            comments: [
                                {
                                    content,
                                    postId: post._id,
                                    _id: new Date().getTime().toString(),
                                    sender: cookieDetails?.userId,
                                    senderDetails: [
                                        {
                                            username: myDetails?.userResult?.username,
                                            profilePictureURL: myDetails?.userResult?.profilePictureURL,
                                        },
                                    ],
                                    isNew: true,
                                },
                                ...page.comments,
                            ],
                        };
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setNewCommentError('Something went wrong, please try again');
        },
        onSettled: () => {
            setCommentContent('');
            setTimeout(() => {
                queryClient.refetchQueries({ queryKey: ['comments', post._id] });
                queryClient.refetchQueries({ queryKey: ['post', post._id] });
            }, CONFETTI_DURATION);
        },
    });

    const handleComment = () => {
        if (commentContent.length === 0) {
            setNewCommentError("Comment can't be empty");
            return;
        }
        setNewCommentError(null);

        createComment(commentContent);
    };

    return (
        <Card
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 2,
                borderRadius: 3,
                boxShadow: 1,
                width: '100%',
            }}
        >
            <Box width={'100%'} mx={'auto'} mt={2} display={'flex'} flexDirection={'row'}>
                <ProfilePicture
                    profilePictureURL={
                        myDetails?.userResult?.profilePictureURL &&
                        `${import.meta.env.VITE_SERVER_URL}/${myDetails.userResult.profilePictureURL}?ts=${Date.now()}`
                    }
                    sx={{ marginRight: '2%' }}
                />
                <Box display={'flex'} flexDirection={'column'} width={'100%'}>
                    <TextField
                        multiline={true}
                        minRows={3}
                        sx={{ width: '100%' }}
                        placeholder={`What do you think about ${
                            post.senderDetails?.[0]?.username ? post.senderDetails?.[0]?.username + "'s" : 'this'
                        } thought?`}
                        value={commentContent}
                        onChange={(e) => {
                            setCommentContent(e.target.value);
                            setNewCommentError(null);
                        }}
                    />
                    <Typography variant='body2' color='error'>
                        {newCommentError ?? '‎' /*Invisible character so the error message is always rendered*/}
                    </Typography>
                </Box>
            </Box>

            <Stack direction='row' sx={{ justifyContent: 'flex-end', marginTop: 2 }}>
                <ActionButton varaint='button' text='Reply' onClick={handleComment} />
            </Stack>
        </Card>
    );
};
