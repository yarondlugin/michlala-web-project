import { Box, SxProps } from '@mui/material';

type Props = {
    children?: JSX.Element;
    sx?: SxProps;
};

export const PageBox = ({ children, sx }: Props) => {
    return <Box sx={{ display: 'flex', flexGrow: 1, placeContent: 'center', placeItems: 'center', ...sx }}>{children}</Box>;
};
