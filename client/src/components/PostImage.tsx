import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, CardMedia, IconButton, Modal, SxProps, Theme, Typography } from '@mui/material';
import { useRef, useState } from 'react';

type Props = {
    imageURI?: string | null;
    size: number;
    isEditing?: boolean;
    onUpload?: (file?: File | null) => void | Promise<void>;
    sx?: SxProps<Theme>;
};

const PostImage = ({ imageURI, size = 200, isEditing = false, onUpload = () => {}, sx }: Props) => {
    const uploadFileRef = useRef<HTMLInputElement>(null);
    const [isViewing, setIsViewing] = useState<boolean>(false);

    const sizeSx: SxProps<Theme> = {
        height: size,
        width: size,
        minHeight: size,
        minWidth: size,
    };

    const handleClick = () => {
        if (isEditing) {
            uploadFileRef.current?.click();
            return;
        }

        setIsViewing(true);
    };

    const handleModalClick = () => {
        setIsViewing(false);
    };

    return (
        <>
            <Box
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.200',
                    ...sizeSx,
                    ...sx,
                }}
            >
                <input
                    ref={uploadFileRef}
                    style={{ display: 'none' }}
                    type='file'
                    accept='image/png, image/jpeg'
                    name='postImage'
                    onChange={(event) => {
                        onUpload(event.target?.files?.[0]);
                    }}
                />
                {imageURI ? (
                    <Box
                        sx={{
                            backgroundImage: `url(${imageURI})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            placeItems: 'center',
                            placeContent: 'center',
                        }}
                    >
                        {isEditing && (
                            <IconButton
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        color: 'text.primary',
                                    },
                                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                                    color: 'rgba(255, 255, 255, 0.8)',
                                }}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onUpload(null);
                                }}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )}
                    </Box>
                ) : (
                    <>
                        <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 64, color: 'grey', mb: 1 }} />
                        <Typography variant='body2' color='grey'>
                            Upload image
                        </Typography>
                    </>
                )}
            </Box>
            <Modal open={isViewing} onClose={handleModalClick}>
                <CardMedia
                    component='img'
                    image={imageURI ?? undefined}
                    sx={{
                        objectFit: 'scale-down',
                        width: 'fit-content',
                        height: 'fit-content',
                        maxWidth: '70%',
                        maxHeight: '70%',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </Modal>
        </>
    );
};

export default PostImage;
