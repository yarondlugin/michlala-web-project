import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { Box, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useMyDetails } from '../../hooks/useMyDetails';
import { useShowProfilePicture } from '../../hooks/useShowProfilePicture';
import { updateUserById, updateUserProfilePictureById } from '../../queries/users';
import { EditUser, User } from '../../types/user';
import { PageBox } from '../PageBox';
import { PageTitle } from '../PageTitle';
import { PostsFeed } from '../PostsFeed';
import { ProfileField } from '../ProfileField';
import { ProfilePicture } from '../ProfilePicture';

const GENERIC_ERROR_MESSAGE = 'Error updating profile picture';
const EDITABLE_USER_DETAILS: Partial<Record<keyof EditUser, { title: string; widthPercentage: number; disabled?: boolean }>> = {
    email: { title: 'Email', widthPercentage: 60, disabled: true },
    username: { title: 'Username', widthPercentage: 60 },
};

type ProfilePageParams = {
    userId: string;
    isEditable: boolean;
};

export const ProfilePage = ({ userId, isEditable }: ProfilePageParams) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState<EditUser>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { showProfilePictureModal, setIsShowingProfilePicture } = useShowProfilePicture(editUser);
    const uploadFileRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    const { isFetching, userResult } = useMyDetails(userId);

    const { mutate: updateUser } = useMutation({
        mutationKey: ['editUser', userId],
        mutationFn: async (data: Partial<EditUser>) => {
            if (data?.newProfilePicture) {
                try {
                    await updateUserProfilePictureById(userId, data.newProfilePicture);
                } catch (error) {
                    if (isAxiosError(error)) {
                        setErrorMessage(error.response?.data ?? GENERIC_ERROR_MESSAGE);
                    } else {
                        setErrorMessage(GENERIC_ERROR_MESSAGE);
                    }
                }
            }

            const { newProfilePicture, profilePictureURL, ...dataWithoutProfilePicture } = data;
            return updateUserById(userId, dataWithoutProfilePicture);
        },
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: ['users', userId] });

            const previousUser = queryClient.getQueryData<User>(['users', userId]);
            queryClient.setQueryData(['users', userId], (oldData?: User) => ({
                ...oldData,
                ...newData,
            }));

            return { previousUser };
        },
        onError: (_error, _newData, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(['users', userId], context.previousUser);
            }
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: ['users', userId] });
        },
    });

    useEffect(() => {
        setEditUser(userResult);
    }, [userResult]);

    const handleFieldEdit = <T extends keyof EditUser>(field: T, value: EditUser[T]) => {
        if (editUser) {
            setEditUser({ ...editUser, [field]: value });
        }
    };

    const handleEnterEditMode = () => {
        setIsEditing(true);
        setErrorMessage(null);
    };

    const handleCancelEditMode = () => {
        setIsEditing(false);
        setEditUser(userResult);
    };

    const handleSave = () => {
        if (editUser) {
            updateUser(editUser);
        }
        setIsEditing(false);
    };

    const handleProfilePictureClick = () => {
        if (isEditing) {
            uploadFileRef.current?.click();
            return;
        }
        if (editUser?.profilePictureURL) {
            setIsShowingProfilePicture(true);
        }
    };

    return (
        <PageBox>
            <PageTitle title='My Profile' />
            {isFetching ? (
                <CircularProgress size={200} />
            ) : (
                <Box
                    display={'flex'}
                    alignItems={'center'}
                    flexDirection={'column'}
                    textAlign={'center'}
                    sx={{ width: 'max(40vw, 500px)' }}
                >
                    <Box onClick={handleProfilePictureClick} sx={{ cursor: 'pointer' }}>
                        <input
                            ref={uploadFileRef}
                            style={{ display: 'none' }}
                            type='file'
                            accept='image/png, image/jpeg'
                            name='profilePicture'
                            onChange={(event) => {
                                if (!editUser) {
                                    return;
                                }

                                setEditUser({ ...editUser, newProfilePicture: event.target?.files?.[0] });
                            }}
                        />
                        <ProfilePicture
                            profilePictureURL={
                                isEditing && editUser?.newProfilePicture
                                    ? URL.createObjectURL(editUser.newProfilePicture)
                                    : editUser?.profilePictureURL &&
                                      `${import.meta.env.VITE_SERVER_URL}/${editUser?.profilePictureURL}?ts=${Date.now()}`
                            }
                            sx={{ width: 200, height: 200, marginBottom: '10%' }}
                        />
                    </Box>
                    {Object.entries(EDITABLE_USER_DETAILS).map(([field, { title, widthPercentage, disabled }]) => (
                        <ProfileField
                            key={field}
                            isEditable={!disabled && isEditing}
                            title={title}
                            widthPercentage={widthPercentage}
                            value={editUser?.[field as keyof User]}
                            handleChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                                handleFieldEdit(field as keyof User, event.target.value)
                            }
                        />
                    ))}
                    <Typography variant='body2' color='error'>
                        {errorMessage ?? '‎' /*Invisible character so the error message is always rendered*/}
                    </Typography>
                    {isEditable && (
                        <Stack direction='row' spacing={4} marginX={'auto'} marginBottom={'3%'}>
                            {isEditing ? (
                                <>
                                    <IconButton onClick={handleCancelEditMode}>
                                        <DoDisturbIcon />
                                    </IconButton>
                                    <IconButton onClick={handleSave}>
                                        <CheckIcon />
                                    </IconButton>
                                </>
                            ) : (
                                <IconButton onClick={handleEnterEditMode}>
                                    <ModeEditIcon />
                                </IconButton>
                            )}
                        </Stack>
                    )}
                </Box>
            )}
            {showProfilePictureModal}
            <PostsFeed title='My Thoughts' filterSender={userId} />
        </PageBox>
    );
};
