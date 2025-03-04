import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, useEffect, useState } from 'react';
import { fetchUserById, updateUserById } from '../../queries/users';
import { User } from '../../types/user';
import { ProfileField } from '../ProfileField';
import { LogoutButton } from '../LogoutButton';

const EDITABLE_USER_DETAILS: Partial<Record<keyof User, { title: string; widthPercentage: number }>> = {
    email: { title: 'Email', widthPercentage: 60 },
    username: { title: 'Username', widthPercentage: 60 },
};

type ProfilePageParams = {
    userId: string;
    isEditable: boolean;
};

export const ProfilePage = ({ userId, isEditable }: ProfilePageParams) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editUser, setEditUser] = useState<User>();
    const queryClient = useQueryClient();

    const { isFetching, data: userResult, } = useQuery<User>({
        queryKey: ['users', userId],
        queryFn: ({ queryKey }) => fetchUserById(queryKey[1] as string),
    });

    const { mutate: updateUser } = useMutation({
        mutationKey: ['users', userId],
        mutationFn: (data: Partial<User>) => updateUserById(userId, data),
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
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['users', userId] });
        },
    });

    useEffect(() => {
        setEditUser(userResult);
    }, [userResult]);

    const handleFieldEdit = <T extends keyof User>(field: T, value: User[T]) => {
        if (editUser) {
            setEditUser({ ...editUser, [field]: value });
        }
    };

    const handleEnterEditMode = () => {
        setIsEditing(true);
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

    return isFetching ? (
        <CircularProgress size={200} />
    ) : (
        <Box display={'flex'} alignItems={'center'} flexDirection={'column'} textAlign={'center'} sx={{ width: 'max(40vw, 500px)' }}>
            <Typography fontSize={48} marginBottom={'20%'}>
                My Profile
            </Typography>
            {Object.entries(EDITABLE_USER_DETAILS).map(([field, { title, widthPercentage }]) => (
                <ProfileField
                    key={field}
                    isEditable={isEditing}
                    title={title}
                    widthPercentage={widthPercentage}
                    value={editUser?.[field as keyof User]}
                    handleChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleFieldEdit(field as keyof User, event.target.value)
                    }
                />
            ))}
            {isEditable && (
                <Box marginX={'auto'} marginTop={'10%'} marginBottom={'3%'}>
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
                </Box>
            )}
			<LogoutButton />
        </Box>
    );
};
