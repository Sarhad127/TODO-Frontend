import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const InvitationAcceptPage = () => {
    const [searchParams] = useSearchParams();
    const boardId = searchParams.get('boardId');
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { userData, setUserData } = useUser();
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

                const response = await fetch(`https://email-verification-production.up.railway.app//api/invitations/accept?boardId=${boardId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to accept invitation');

                const updatedBoardsResponse = await fetch('https://email-verification-production.up.railway.app//api/boards', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!updatedBoardsResponse.ok) throw new Error('Failed to fetch boards');

                const updatedBoards = await updatedBoardsResponse.json();

                const newBoard = updatedBoards.find(board => board.id === boardId);
                const existingBoards = updatedBoards.filter(board => board.id !== boardId);
                existingBoards.push(newBoard);

                setUserData(prevData => ({
                    ...prevData,
                    boards: existingBoards,
                }));

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
    }, [boardId, token, navigate, userData, setUserData]);

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
