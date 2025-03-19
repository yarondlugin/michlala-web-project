import { Box, SxProps } from '@mui/material';

type Props = {
    children?: JSX.Element | JSX.Element[];
    sx?: SxProps;
};

export const PageBox = ({ children, sx }: Props) => {
    return (
        <Box
            id='page-box'
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '90vh',
                width: '100%',
                paddingTop: '1%',
                placeItems: 'center',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
};
