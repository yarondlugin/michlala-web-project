import { Box, Card, Stack, TextField, Typography } from '@mui/material';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { CONFETTI_DURATION } from '../consts';
import { useMyDetails } from '../hooks/useMyDetails';
import { useRestrictedPage } from '../hooks/useRestrictedPage';
import { createNewPost, updatePostImageById } from '../queries/posts';
import { NewPost, PostBatchResponse } from '../types/post';
import { ActionButton } from './ActionButton';
import PostImage from './PostImage';
import { ProfilePicture } from './ProfilePicture';

type NewPostCardProps = {
    onPost?: () => void;
};

export const NewPostCard = ({ onPost }: NewPostCardProps) => {
    const cookieDetails = useRestrictedPage();
    const myDetails = useMyDetails(cookieDetails?.userId);

    const [newPostError, setNewPostError] = useState<string | null>(null);
    const [postTitle, setPostTitle] = useState<string>('');
    const [postContent, setPostContent] = useState<string>('');
    const [postImage, setPostImage] = useState<File | null | undefined>();

    const postImageSrc = useMemo(() => {
        if (postImage) {
            return URL.createObjectURL(postImage);
        }
    }, [postImage]);

    const queryClient = useQueryClient();
    const { mutate: createPost } = useMutation({
        mutationKey: ['newPost'],
        mutationFn: (post: NewPost) => createNewPost(post),
        onMutate: async (newPost) => {
            onPost?.();
            await queryClient.cancelQueries({ queryKey: ['posts'] });

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                return {
                    ...oldData,
                    pages: oldData.pages.map((page, index) => {
                        if (index !== 0) {
                            return page;
                        }

                        return {
                            ...page,
                            posts: [
                                {
                                    ...newPost,
                                    _id: new Date().getTime().toString(),
                                    sender: cookieDetails?.userId,
                                    senderDetails: [
                                        {
                                            username: myDetails?.userResult?.username,
                                            profilePictureURL: myDetails?.userResult?.profilePictureURL,
                                        },
                                    ],
                                    isNew: true,
                                    imageURI: postImageSrc,
                                },
                                ...page.posts,
                            ],
                        };
                    }),
                };
            });
        },
        onError: (error) => {
            console.error(error);
            setNewPostError('Something went wrong, please try again');
        },
        onSettled: async (data) => {
            if (postImage && data?._id) {
                await updatePostImageById(data._id, postImage);
            }
            setPostContent('');
            setPostTitle('');
            setPostImage(undefined);
            setTimeout(() => queryClient.refetchQueries({ queryKey: ['posts'] }), CONFETTI_DURATION);
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
                <ProfilePicture
                    profilePictureURL={
                        myDetails?.userResult?.profilePictureURL &&
                        `${import.meta.env.VITE_SERVER_URL}/${myDetails.userResult.profilePictureURL}?ts=${Date.now()}`
                    }
                    sx={{ marginRight: '2%' }}
                />
                <Stack width={'100%'}>
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
                    <Typography variant='body2' color='error'>
                        {newPostError ?? '‎' /*Invisible character so the error message is always rendered*/}
                    </Typography>
                    <Stack direction='row' spacing={2} sx={{ justifyContent: 'space-between' }}>
                        <TextField
                            multiline={true}
                            minRows={3}
                            sx={{ width: '100%', marginTop: 2, flexGrow: 1 }}
                            placeholder='Care to elaborate? (optional)'
                            value={postContent}
                            onChange={(e) => {
                                setPostContent(e.target.value);
                                setNewPostError(null);
                            }}
                        />
                        <PostImage imageURI={postImageSrc} size={200} isEditing={true} onUpload={(file) => setPostImage(file)} />
                    </Stack>
                </Stack>
            </Box>

            <Stack direction='row' sx={{ justifyContent: 'flex-end', marginTop: 2 }}>
                <ActionButton varaint='button' text='Post' onClick={handlePost} />
            </Stack>
        </Card>
    );
};
