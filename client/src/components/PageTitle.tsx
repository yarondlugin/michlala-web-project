import { Typography } from '@mui/material';

type Props = {
    title: string;
};

export const PageTitle = ({ title }: Props) => {
    return (
        <Typography variant='h3' sx={{ width: '45%', textAlign: 'start', marginBottom: 3 }}>
            {title}
        </Typography>
    );
};
