import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { Box, CardMedia, Modal, SxProps, Theme, Typography } from '@mui/material';
import { useRef, useState } from 'react';

type Props = {
    imageURI?: string;
    size: number;
    isEditing?: boolean;
    onUpload?: (file?: File) => void | Promise<void>;
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
                    <CardMedia
                        component='img'
                        image={imageURI}
                        alt='Post image'
                        title={isEditing ? 'Click to edit image' : 'Click to view image'}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    />
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
                    image={imageURI}
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
