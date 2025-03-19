import { Button, SxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Variant } from '@mui/material/styles/createTypography';

type Props = {
    icon?: ReactNode;
    text: string;
    onClick?: () => void | Promise<void>;
    hoverColor?: string;
    varaint?: Variant;
	sx?: SxProps
};

export const ActionButton = ({ icon, text, hoverColor = 'primary.main', varaint = 'caption', onClick, sx }: Props) => {
    return (
        <Button
            startIcon={icon}
            size='small'
            sx={{
                color: 'text.secondary',
                textTransform: 'none',
                padding: '4px 8px',
                '&:hover': {
                    color: hoverColor,
                    backgroundColor: 'transparent',
                },
                transition: 'color 0.2s',
				...sx
            }}
            onClick={onClick}
        >
            <Typography variant={varaint}>{text}</Typography>
        </Button>
    );
};
