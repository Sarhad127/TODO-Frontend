import React, { useState } from 'react';
import BackgroundSettingsModal from './BackgroundSettingsModal';

const BackgroundManager = ({ children }) => {
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [showBackgroundModal, setShowBackgroundModal] = useState(false);

    const changeBackgroundColor = (color) => {
        setBackgroundColor(color);
        setBackgroundImage(null);
    };

    const changeBackgroundImage = (imageUrl) => {
        setBackgroundImage(imageUrl);
        setBackgroundColor('transparent');
    };

    const backgroundStyle = {
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return children({
        backgroundStyle,
        showBackgroundModal,
        setShowBackgroundModal,
        changeBackgroundColor,
        changeBackgroundImage,
        BackgroundSettingsModal: showBackgroundModal ? (
            <BackgroundSettingsModal
                onClose={() => setShowBackgroundModal(false)}
                onColorChange={changeBackgroundColor}
                onImageUpload={changeBackgroundImage}
            />
        ) : null
    });
};

export default BackgroundManager;