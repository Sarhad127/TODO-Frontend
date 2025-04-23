import React, { useState, useEffect } from 'react';
import './styles/Avatar.css';
import { jwtDecode } from 'jwt-decode';

const UserAvatar = () => {
    const [username, setUsername] = useState('Unknown');

    useEffect(() => {
        const updateAvatar = () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    const name = decodedToken.sub || 'Unknown';
                    setUsername(name);
                } catch (error) {
                    console.error('Failed to decode token:', error);
                    setUsername('Unknown');
                }
            } else {
                setUsername('Unknown');
            }
        };

        updateAvatar();

        const handleStorage = (event) => {
            if (event.key === 'token') {
                updateAvatar();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const getInitials = (name) => {
        if (!name || name === 'Unknown') return 'U';
        const parts = name.split(/[.\-_]/);
        return parts.map(part => part[0]?.toUpperCase()).join('').slice(0, 2);
    };

    return (
        <div className="avatar-container">
            <div className="avatar">{getInitials(username)}</div>
        </div>
    );
};

export default UserAvatar;
