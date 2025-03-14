import { Avatar, Box, Card, Stack, TextField, Typography } from '@mui/material';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { createNewPost } from '../queries/posts';
import { NewPost, PostBatchResponse } from '../types/post';
import { ActionButton } from './ActionButton';
import { useMyDetails } from '../hooks/useMyDetails';

type NewPostCardProps = {
    onPost?: () => void;
};

export const NewPostCard = ({ onPost }: NewPostCardProps) => {
    const cookieDetails = useRestrictedPage();
    const myDetails = cookieDetails && useMyDetails(cookieDetails?.userId);

    const [newPostError, setNewPostError] = useState<string | null>(null);
    const [postTitle, setPostTitle] = useState<string>('');
    const [postContent, setPostContent] = useState<string>('');
    const queryClient = useQueryClient();
    const { mutate: createPost } = useMutation({
        mutationKey: ['posts'],
        mutationFn: (post: NewPost) => createNewPost(post),
        onMutate: async (newPost) => {
            onPost?.();
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page, index) => {
                        if (index === 0) {
                            return {
                                ...page,
                                posts: [
                                    {
                                        ...newPost,
                                        _id: new Date().getTime().toString(),
                                        sender: cookieDetails?.userId,
                                        senderDetails: [{ username: myDetails?.userResult?.username }],
                                        isNew: true,
                                    },
                                    ...page.posts,
                                ],
                            };
                        }

                        return page;
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setNewPostError('Something went wrong, please try again');
        },
        onSettled: () => {
            setPostContent('');
            setPostTitle('');
            setTimeout(() => queryClient.refetchQueries({ queryKey: ['posts'] }), 4000);
        },
    });

    const handlePost = () => {
        if (postTitle.length === 0) {
            setNewPostError("Title can't be empty");
            return;
        }
        setNewPostError(null);

        createPost({
            title: postTitle,
            content: postContent,
        });
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
                <Avatar sx={{ width: 48, height: 48, marginRight: 2 }} />
                <Box display={'flex'} flexDirection={'column'} width={'100%'}>
                    <TextField
                        sx={{ width: '100%' }}
                        placeholder='What shower thought did you have today?'
                        error={!!newPostError}
                        value={postTitle}
                        onChange={(e) => {
                            setPostTitle(e.target.value);
                            setNewPostError(null);
                        }}
                    />
                    {newPostError && (
                        <Typography variant='body2' color='error'>
                            {newPostError}
                        </Typography>
                    )}
                    <TextField
                        multiline={true}
                        minRows={3}
                        sx={{ width: '100%', marginTop: 2 }}
                        placeholder='Care to elaborate? (optional)'
                        value={postContent}
                        onChange={(e) => {
                            setPostContent(e.target.value);
                            setNewPostError(null);
                        }}
                    />
                </Box>
            </Box>

            <Stack direction='row-reverse' sx={{ justifyContent: 'flex-start', marginTop: 2 }}>
                <ActionButton varaint='button' text='Post' onClick={handlePost} />
            </Stack>
        </Card>
    );
};
