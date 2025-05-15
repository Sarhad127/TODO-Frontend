import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const UserAvatar = ({ size = 'medium', userData = null }) => {
    const [avatarData, setAvatarData] = useState({
        backgroundColor: '#3f51b5',
        initials: '',
        imageUrl: '',
        username: 'Unknown'
    });

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

    const sizeConfig = {
        small: { diameter: '32px', fontSize: '14px' },
        medium: { diameter: '48px', fontSize: '18px' },
        large: { diameter: '80px', fontSize: '28px' }
    };

    const { diameter, fontSize } = sizeConfig[size] || sizeConfig.medium;

    const getInitials = () => {
        if (avatarData.initials) return avatarData.initials;
        const parts = avatarData.username.split(/[.\-_]/);
        return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2);
    };

    return (
        <div className="avatar-container">
            <div
                className="avatar"
                style={{
                    backgroundColor: avatarData.backgroundColor,
                    width: diameter,
                    height: diameter,
                    fontSize: fontSize,
                    backgroundImage: avatarData.imageUrl ? `url(${avatarData.imageUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: '50%',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {!avatarData.imageUrl && getInitials()}
            </div>
        </div>
    );
};

export default UserAvatar;
