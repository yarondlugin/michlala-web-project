import { Button, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
    icon: ReactNode;
	text: string;
	hoverColor?: string
};

export const ActionButton = ({ icon, text, hoverColor = 'primary.main' }: Props) => {
    return (
        <Button
            startIcon={icon}
            size="small"
            sx={{
                color: 'text.secondary',
				textTransform: 'none',
                padding: '4px 8px',
                '&:hover': {
					color: hoverColor,
                    backgroundColor: 'transparent',
                },
				transition: 'color 0.2s',
            }}
        >
            <Typography variant="caption">{text}</Typography>
        </Button>
    );
};
