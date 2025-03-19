import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost } from '../queries/posts';
import { PostBatchResponse } from '../types/post';
import { useRestrictedPage } from './useRestrictedPage';

export const useLikePost = (postId: string) => {
    const queryClient = useQueryClient();
    const userId = useRestrictedPage()?.userId;

    const { mutate: like } = useMutation({
        mutationKey: ['likePost', postId],
        mutationFn: async () => await likePost(postId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
			await queryClient.cancelQueries({ queryKey: ['post', postId] });

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                if (!oldData) {
                    return;
                }

                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        if (!page.posts.some((post) => post._id === postId)) {
                            return page;
                        }

                        return {
                            ...page,
                            posts: page.posts.map((post) => {
                                if (post._id !== postId) {
                                    return post;
                                }

                                return {
                                    ...post,
                                    likedUsers: [...(post.likedUsers || []), userId],
                                };
                            }),
                        };
                    }),
                };
            });
        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['posts'] });
            queryClient.refetchQueries({ queryKey: ['post', postId] });
        },
    });

    const { mutate: unlike } = useMutation({
        mutationKey: ['unlikePost', postId],
        mutationFn: async () => await unlikePost(postId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['posts'] });
            await queryClient.cancelQueries({ queryKey: ['post', postId] });

            queryClient.setQueryData(['posts'], (oldData: InfiniteData<PostBatchResponse, unknown>) => {
                if (!oldData) {
                    return;
                }

                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => {
                        if (!page.posts.some((post) => post._id === postId)) {
                            return page;
                        }

                        return {
                            ...page,
                            posts: page.posts.map((post) => {
                                if (post._id !== postId) {
                                    return post;
                                }

                                return {
                                    ...post,
                                    likedUsers: post.likedUsers?.filter((id) => id !== userId),
                                };
                            }),
                        };
                    }),
                };
            });
        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ['posts'] });
            queryClient.refetchQueries({ queryKey: ['post', postId] });
        },
    });

    return { like, unlike };
};
