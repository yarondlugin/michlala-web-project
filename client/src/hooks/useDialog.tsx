import { Dialog } from '@base-ui-components/react/dialog';
import styles from './useDialog.module.css';
import { Box, Button, Card } from '@mui/material';

interface Props {
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
                        {confirmText && <Button variant="contained" onClick={onConfirm}>
                            {confirmText}
                        </Button>}
                        {confirmText && cancelText && <Box sx={{ width: '5rem' }} />}
                        {cancelText && <Dialog.Close render={<Button onClick={onCancel}>{cancelText}</Button>} />}
                    </Box>
                </Card>
            </Dialog.Popup>
        </Dialog.Portal>
    );

    const openCompoent = <Dialog.Trigger render={<Button variant="contained">{openText}</Button>} />;

    return {
        dialogComponent,
        openCompoent,
    };
};
