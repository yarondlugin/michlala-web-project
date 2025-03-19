import { Card, Modal, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { ActionButton } from './ActionButton';

type DeletionModalProps = {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
    note?: string;
    confirmText?: string;
    cancelText?: string;
};

export const DeletionModal = ({
    isOpen,
    onCancel,
    onConfirm,
    title,
    description,
	note,
    confirmText = 'Yes, delete',
    cancelText = 'No, cancel',
}: DeletionModalProps) => {
    return (
        <Modal open={isOpen} onClose={onCancel} disableScrollLock>
            <Card
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(500px, 50vw)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 2,
                    borderRadius: 3,
                    boxShadow: 1,
                }}
            >
                <Typography variant='h6' sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {title}
                </Typography>
                <Typography variant='body1' sx={{ marginBottom: 2 }}>
                    {description}
                </Typography>
                {note && (
                    <Typography variant='body1' sx={{ fontStyle: 'italic', marginBottom: 2 }}>
                        {note}
                    </Typography>
                )}
                <Stack direction='row' sx={{ justifyContent: 'space-around' }}>
                    <ActionButton text={confirmText} icon={<CheckIcon />} hoverColor='error.main' onClick={onConfirm} />
                    <ActionButton text={cancelText} hoverColor='text.primary' onClick={onCancel} icon={<DoDisturbIcon />} />
                </Stack>
            </Card>
        </Modal>
    );
};
