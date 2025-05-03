import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [decodedToken, setDecodedToken] = useState(null);
    const [deletePassword, setDeletePassword] = useState('');

    useEffect(() => {
        if (token) {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setDecodedToken(decoded);
            const currentUsername = decoded.sub || decoded.username;
            setUsername(currentUsername);
        }
    }, [token]);

    const handleUsernameUpdate = async () => {
        setError('');
        setMessage('');

        if (!username.trim()) {
            setError('Username cannot be empty.');
            return;
        }

        if (decodedToken && (username === decodedToken.sub || username === decodedToken.username)) {
            setError('New username cannot be the same as the current username.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/user/update-username', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ username }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message || 'Username updated successfully.');

                if (data.token) {
                    if (localStorage.getItem('token')) {
                        localStorage.setItem('token', data.token);
                    } else {
                        sessionStorage.setItem('token', data.token);
                    }
                }
            }
            else {
                const data = await response.json();
                setError(data.message || 'Failed to update username.');
            }
        } catch (err) {
            setError('Network error.');
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

    const handleAccountDelete = async () => {
        setError('');
        setMessage('');

        const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmDelete) return;

        try {
            const response = await fetch('http://localhost:8080/user/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setMessage('Account deleted successfully.');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/auth/login';
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete account.');
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
                <input
                    className="username-text"
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
                <hr />

                <div className="username-formGroup">
                    <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                    <button onClick={handleAccountDelete} style={{ backgroundColor: 'red', color: 'white' }}>
                        Delete Account
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Profile;
