import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

const UserAvatar = ({
                        size = 'medium',
                        userData = null,
                        isSelected = false,
                        showSelectionIndicator = true
                    }) => {
    const [avatarData, setAvatarData] = useState({
        backgroundColor: '#3f51b5',
        initials: '',
        imageUrl: '',
        username: 'Unknown'
    });

    const sizeConfig = useMemo(() => ({
        small: { diameter: 32, fontSize: 14, borderWidth: 2 },
        medium: { diameter: 48, fontSize: 18, borderWidth: 3 },
        large: { diameter: 80, fontSize: 28, borderWidth: 4 }
    }), []);

    const { diameter, fontSize, borderWidth } = sizeConfig[size] || sizeConfig.medium;

    const getInitials = useMemo(() => {
        return () => {
            if (avatarData.initials) return avatarData.initials;
            const parts = avatarData.username.split(/[.\-_]/);
            return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2);
        };
    }, [avatarData.initials, avatarData.username]);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (userData) {
                setAvatarData({
                    backgroundColor: userData.avatarBackgroundColor || '#3f51b5',
                    initials: userData.avatarInitials || '',
                    imageUrl: userData.avatarImageUrl || '',
                    username: userData.username || 'Unknown'
                });
                return;
            }

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                const fetchedData = await api.getAvatar(token);

                setAvatarData({
                    backgroundColor: fetchedData.avatarBackgroundColor || '#3f51b5',
                    initials: fetchedData.avatarInitials || '',
                    imageUrl: fetchedData.avatarImageUrl || '',
                    username: decoded.sub || 'Unknown'
                });
            } catch (error) {
                console.error('Error fetching avatar:', error);
                setAvatarData(prev => ({
                    ...prev,
                    backgroundColor: '#3f51b5',
                    initials: prev.initials || '?',
                    imageUrl: ''
                }));
            }
        };

        fetchAvatar();

        const handleStorage = (e) => {
            if (!userData && e.key === 'token') {
                fetchAvatar();
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [userData]);

    const avatarStyle = {
        backgroundColor: avatarData.backgroundColor,
        width: `${diameter}px`,
        height: `${diameter}px`,
        fontSize: `${fontSize}px`,
        backgroundImage: avatarData.imageUrl ? `url(${avatarData.imageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        borderRadius: '50%',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: isSelected ? `${borderWidth}px solid #ff4757` : 'none',
        boxShadow: isSelected ? '0 0 0 2px rgba(255, 71, 87, 0.3)' : 'none',
        position: 'relative',
        transition: 'all 0.2s ease'
    };

    return (
        <div className="avatar-container" title={avatarData.username}>
            <div className="avatar" style={avatarStyle}>
                {!avatarData.imageUrl && getInitials()}
                {isSelected && showSelectionIndicator && (
                    <div
                        className="selection-indicator"
                        style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: `${Math.max(10, diameter/8)}px`,
                            height: `${Math.max(10, diameter/8)}px`,
                            backgroundColor: '#ff4757',
                            borderRadius: '50%',
                            border: '2px solid white'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

UserAvatar.propTypes = {
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    userData: PropTypes.shape({
        avatarBackgroundColor: PropTypes.string,
        avatarInitials: PropTypes.string,
        avatarImageUrl: PropTypes.string,
        username: PropTypes.string
    }),
    isSelected: PropTypes.bool,
    showSelectionIndicator: PropTypes.bool
};

export default React.memo(UserAvatar);