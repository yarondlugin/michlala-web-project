import { Avatar, SxProps, Theme } from '@mui/material';

type ProfilePictureProps = {
    profilePictureURL?: string;
    sx?: SxProps<Theme>;
};

const getPropertyFromSX = (property: string, sx?: SxProps<Theme>) =>
    sx && typeof sx === 'object' && property in sx ? sx[property as keyof SxProps<Theme>] : undefined;

export const ProfilePicture = ({ profilePictureURL, sx }: ProfilePictureProps) => {
    return profilePictureURL ? (
        <img
            src={profilePictureURL}
            width={getPropertyFromSX('width', sx) ?? 48}
            height={getPropertyFromSX('height', sx) ?? 48}
            style={{ borderRadius: getPropertyFromSX('width', sx) ?? '48px', ...(sx as React.CSSProperties) }}
        />
    ) : (
        <Avatar sx={{ width: getPropertyFromSX('width', sx) ?? 48, height: getPropertyFromSX('height', sx) ?? 48, ...sx }} />
    );
};
