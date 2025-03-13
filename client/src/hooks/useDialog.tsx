import { Dialog } from '@base-ui-components/react/dialog';
import styles from './useDialog.module.css';
import { Box, Button, Card } from '@mui/material';
import { useState } from 'react';

type Props = {
    title?: string;
    description?: string;
    cancelText?: string;
	onCancel?: () => void | Promise<void>;
    confirmText?: string;
    onConfirm?: () => void | Promise<void>;
    openText?: string;
}

export const useDialog = ({
    title = 'Title',
    description = 'Description',
    cancelText = '',
    onCancel = () => {},
    confirmText = '',
    onConfirm = () => {},
    openText = '',
}: Props) => {
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

	const handleConfirm = async () => {
		await onConfirm();
		await setDialogOpen(false);
	};

	const handleCancel = async () => {
		await onCancel();
		await setDialogOpen(false);
	};

    const dialogComponent = (
        <Dialog.Portal keepMounted>
            <Dialog.Backdrop className={styles.Backdrop} />
            <Dialog.Popup className={styles.Popup}>
                <Card
                    sx={{
                        padding: '2rem',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Description>{description}</Dialog.Description>
                    <Box sx={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'space-around' }}>
                        {confirmText && <Button variant="contained" onClick={handleConfirm}>
                            {confirmText}
                        </Button>}
                        {confirmText && cancelText && <Box sx={{ width: '5rem' }} />}
                        {cancelText && <Dialog.Close render={<Button onClick={handleCancel}>{cancelText}</Button>} />}
                    </Box>
                </Card>
            </Dialog.Popup>
        </Dialog.Portal>
    );

    const openCompoent = <Dialog.Trigger render={<Button variant="contained">{openText}</Button>} />;

    return {
		dialogOpen,
		setDialogOpen,
        dialogComponent,
        openCompoent,
    };
};
