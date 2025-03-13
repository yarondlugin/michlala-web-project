import { Box, SxProps } from '@mui/material';

type Props = {
    children?: JSX.Element | JSX.Element[];
    sx?: SxProps;
};

export const PageBox = ({ children, sx }: Props) => {
    return (
        <Box
            id='page-box'
            sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', width: '100%', placeItems: 'center', ...sx }}
        >
            {children}
        </Box>
    );
};
