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
    const [isVerifying, setIsVerifying] = useState(false);

    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);
    const [isOAuthUser, setIsOAuthUser] = useState(false);

    useEffect(() => {
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const currentUsername = decoded.sub || decoded.username;
                setUsername(currentUsername);
                setEmail(decoded.email || '');
                const expDate = new Date(decoded.exp * 1000);
                const isExpired = expDate < new Date();
                if (isExpired) {
                    setError('Your session has expired. Please log in again.');
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    window.location.href = '/auth/login';
                    return;
                }
                setIsOAuthUser(decoded.iss !== 'Pluto');
            } catch (error) {
                setError('Invalid token or unable to decode the token.');
            }
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
            } else {
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

    const requestDeletionEmail = async () => {
        setError('');
        setMessage('');
        try {
            const response = await fetch('http://localhost:8080/user/request-account-deletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`,
                },
                body: `username=${encodeURIComponent(username)}`
            });
            if (response.ok) {
                setMessage('Verification code sent to your email.');
                setShowVerificationCodeInput(true);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to send verification code.');
            }
        } catch (err) {
            setError('Network error while requesting verification code.');
        }
    };

    const getUsernameFromToken = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub;
        } catch (e) {
            return null;
        }
    };

    const confirmAccountDeletion = async () => {
        setError('');
        setMessage('');
        setIsVerifying(true);
        const username = getUsernameFromToken(token);
        if (!username) {
            setError('Unable to extract username from token.');
            setIsVerifying(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/user/confirm-account-deletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username: username,
                    verificationCode: verificationCode
                })
            });

            if (response.ok) {
                setMessage('Account deleted successfully.');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '/auth/login';
                }, 2000);
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to delete account. Invalid code?');
            }
        } catch (err) {
            setError('Network error during account deletion.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleAccountDelete = () => {
        const confirmDelete = window.confirm(
            'Are you absolutely sure you want to delete your account?\n' +
            'This will permanently erase all your data and cannot be undone.'
        );

        if (confirmDelete) {
            requestDeletionEmail();
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
            </div>

            <hr />

            <div className="account-deletion-section">
                <h3>Delete Account:</h3>
                <p className="warning-message">
                    Warning: This will permanently delete your account and all associated data.
                </p>

                {showVerificationCodeInput ? (
                    <>
                        <div className="verification-code-group">
                            <label>Enter verification code sent to email:</label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="6-digit code"
                                maxLength="6"
                            />
                        </div>
                        <button
                            onClick={confirmAccountDeletion}
                            className="delete-account-button"
                            disabled={isVerifying || verificationCode.length < 6}
                        >
                            {isVerifying ? 'Deleting...' : 'Confirm Deletion'}
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleAccountDelete}
                        className="delete-account-button"
                    >
                        Request Account Deletion
                    </button>
                )}
            </div>
        </div>
    );
};

export default Profile;