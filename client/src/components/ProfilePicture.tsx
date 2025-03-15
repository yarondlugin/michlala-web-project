import { Avatar, SxProps, Theme } from '@mui/material';
import { useMemo } from 'react';

type ProfilePictureProps = {
    profilePictureURL?: string;
    sx?: SxProps<Theme>;
};

const getPropertyFromSX = (property: string, sx?: SxProps<Theme>) =>
    sx && typeof sx === 'object' && property in sx ? sx[property as keyof SxProps<Theme>] : undefined;

export const ProfilePicture = ({ profilePictureURL, sx }: ProfilePictureProps) => {
    const { width, height } = useMemo(() => {
        const width = getPropertyFromSX('width', sx) ?? 48;
        const height = getPropertyFromSX('height', sx) ?? 48;
        return { width, height };
    }, [sx]);

    return profilePictureURL ? (
        <img src={profilePictureURL} width={width} height={height} style={{ borderRadius: width, ...(sx as React.CSSProperties) }} />
    ) : (
        <Avatar sx={{ width, height, ...sx }} />
    );
};
