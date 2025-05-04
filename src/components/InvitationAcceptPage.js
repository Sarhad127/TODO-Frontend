import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const InvitationAcceptPage = () => {
    const [searchParams] = useSearchParams();
    const boardId = searchParams.get('boardId');
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { userData } = useUser();
    const [message, setMessage] = useState('Processing invitation...');
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const acceptInvitation = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                if (!token) {
                    sessionStorage.setItem('invitationBoardId', boardId);
                    navigate('/auth/login?redirect=accept-invitation');
                    return;
                }

                const response = await fetch(`http://localhost:8080/api/invitations/accept?boardId=${boardId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to accept invitation');

                setMessage('Invitation accepted! Redirecting to board...');
                setIsSuccess(true);

                setTimeout(() => navigate('/home'), 2000);
            } catch (error) {
                setMessage(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        acceptInvitation();
    }, [boardId, token, navigate, userData]);

    return (
        <div className="invitation-container">
            <div className="invitation-card">
                {isLoading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    <div className={`status-message ${isSuccess ? 'success' : 'error'}`}>
                        {message}
                        {!isSuccess && (
                            <button
                                className="retry-button"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvitationAcceptPage;