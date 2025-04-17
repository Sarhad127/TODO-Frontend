import React from 'react';
import './styles/Avatar.css';
import { jwtDecode } from 'jwt-decode';

const UserAvatar = () => {
    const token = localStorage.getItem('token');
    let userEmail = '';

    if (token) {
        try {
            const decodedToken = jwtDecode(token);
            userEmail = decodedToken.email || 'Unknown';
        } catch (error) {
            console.error("Invalid token:", error);
            userEmail = 'Unknown';
        }
    } else {
        userEmail = 'Unknown';
    }

    const getInitials = (email) => {
        if (!email) return 'U';
        const nameParts = email.split('@')[0].split('.');
        return nameParts.map((part) => part.charAt(0).toUpperCase()).join('');
    };

    return (
        <div className="avatar-container">
            <div className="avatar">{getInitials(userEmail)}</div>
        </div>
    );
};

export default UserAvatar;
