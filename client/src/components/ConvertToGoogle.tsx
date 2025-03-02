import GoogleIcon from '@mui/icons-material/Google';
import { Button, SxProps, Theme } from '@mui/material';
import { Dialog } from '@base-ui-components/react';
import { HttpStatusCode } from 'axios';
import { axiosClient } from '../queries/axios';
import { useDialog } from '../hooks/useDialog';

interface Props {
    userId: string;
	onSuccess?: () => void | Promise<void>;
	sx?:  SxProps<Theme>;
}

export const ConvertToGoogle = ({ userId, onSuccess, sx }: Props) => {
    const { dialogComponent, dialogOpen, setDialogOpen } = useDialog({
        title: 'Convert to Google',
        description: 'Your account has been converted to a Google account - next time you can sign in with Google',
        confirmText: 'OK',
		onConfirm: onSuccess
    });

    const {
        dialogComponent: errorDialogComponent,
        dialogOpen: errorDialogOpen,
        setDialogOpen: setErrorDialogOpen,
    } = useDialog({
        title: 'Error Converting to Google',
        description: 'Something went wrong, your account has not been converted to a Google account',
        cancelText: 'OK',
    });

    const handleConvert = async () => {
        try {
            const result = await axiosClient.post(`/users/${userId}/convertToGoogle`);
            if (result.status === HttpStatusCode.Ok) {
                await setDialogOpen(true);
            } else {
                await setErrorDialogOpen(true);
            }
        } catch (error) {
            await setErrorDialogOpen(true);
        }
    };

    return (
        <>
            <Button sx={{ alignSelf: 'center', marginTop: '1rem', width: 'max-content', ...sx }} onClick={handleConvert} endIcon={<GoogleIcon />}>
                Convert to Google
            </Button>
            <Dialog.Root open={dialogOpen}>{dialogComponent}</Dialog.Root>
            <Dialog.Root open={errorDialogOpen}>{errorDialogComponent}</Dialog.Root>
        </>
    );
};
