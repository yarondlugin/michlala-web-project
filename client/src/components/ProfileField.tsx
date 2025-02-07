import { Box, TextField, Typography } from '@mui/material';
import { ChangeEventHandler } from 'react';

type ProfileFieldParams = {
    isEditable: boolean;
    title: string;
    widthPercentage: number;
    value?: string;
    handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export const ProfileField = ({ isEditable, title, widthPercentage, value, handleChange }: ProfileFieldParams) => (
    <Box display={'flex'} flexDirection={'row'} alignItems={'center'} width={'100%'} marginBottom={'3%'}>
        <Typography width={'5%'} marginRight={'10%'}>
            {title}
        </Typography>
        <TextField sx={{ width: `${widthPercentage}%` }} disabled={!isEditable} value={value} onChange={handleChange} />
    </Box>
);
