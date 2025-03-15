import { Modal } from '@mui/material';
import { useState } from 'react';
import { User } from '../types/user';

export const useShowProfilePicture = (user?: User) => {
    const [isShowingProfilePicture, setIsShowingProfilePicture] = useState(false);

    return {
        setIsShowingProfilePicture,
        showProfilePictureModal: user ? (
            <Modal open={isShowingProfilePicture} onClose={() => setIsShowingProfilePicture(false)} disableScrollLock>
                <img
                    src={`${import.meta.env.VITE_SERVER_URL}/${user.profilePictureURL}?t=${Date.now()}`} // force refetch for image updates
                    style={{
                        width: 'min(70vh, 70vw)',
                        height: 'min(70vh, 70vw)',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                />
            </Modal>
        ) : (
            <></>
        ),
    };
};
