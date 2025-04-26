import React, { useState } from 'react';
import './Profile.css';
import UserAvatar from '../UserAvatar';

const ProfilePage = () => {
    const [username, setUsername] = useState('example_user');
    const [email, setEmail] = useState('example@hotmail.com');

    const handleUsernameChange = (e) => {
        setUsername(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="avatar-wrapper">
                    <UserAvatar />
                </div>

                <ul>
                    <li>
                        <label htmlFor="email" className="profile-email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            className="profile-input"
                        />
                    </li>
                    <li>
                        <label htmlFor="username" className="profile-Username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={handleUsernameChange}
                            className="profile-input"
                        />
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default ProfilePage;
