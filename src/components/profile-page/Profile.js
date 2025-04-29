import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUsernameUpdate = async () => {
        setError('');
        setMessage('');

        try {
            console.log('Sending request to update username...');

            const response = await fetch('http://localhost:8080/user/update-username', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username }),
            });

            console.log('Response received:', response);

            if (response.ok) {
                setMessage('Username updated successfully.');
                console.log('Username updated successfully');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to update username.');
                console.error('Error:', data.message || 'Failed to update username.');
            }
        } catch (err) {
            setError('Network error.');
            console.error('Network error:', err);
        }
    };

    const handlePasswordUpdate = async () => {
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/user/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (response.ok) {
                setMessage('Password updated successfully.');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to change password.');
            }
        } catch (err) {
            setError('Network error.');
        }
    };

    return (
        <div className="user-profileContainer">
            <h2>User Profile</h2>

            {message && <div className="username-success">{message}</div>}
            {error && <div className="username-error">{error}</div>}

            <div className="username-formGroup">
                <label>New Username:</label>
                <input className="username-text"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                />
                <button onClick={handleUsernameUpdate}>Update Username</button>
            </div>

            <hr />

            <div className="username-formGroup">
                <label>Current Password:</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />

                <label>New Password:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <label>Confirm New Password:</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button onClick={handlePasswordUpdate}>Change Password</button>
            </div>
        </div>
    );
};

export default Profile;
