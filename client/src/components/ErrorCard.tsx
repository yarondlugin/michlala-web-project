import { Card, CardContent, Stack, SxProps, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { ActionButton } from './ActionButton';

type Props = {
    title: string;
    message: string;
    showBackToFeedButton?: boolean;
    sx?: SxProps;
};

export const ErrorCard = ({ title, message, showBackToFeedButton = false, sx }: Props) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ padding: 2, borderRadius: 3, boxShadow: 1, ...sx }}>
            <CardContent>
                <Typography variant='h5' sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                    {title}
                </Typography>
                <Typography variant='body1' sx={{ marginBottom: 2 }}>
                    {message}
                </Typography>
                {showBackToFeedButton && (
                    <Stack direction='row' justifyContent='center'>
                        <ActionButton varaint='button' text='Back To Feed' onClick={() => navigate({ to: '/feed' })} />
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
};
