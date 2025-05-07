import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateUserData } = useUser();

    useEffect(() => {
        const handleOAuthSuccess = async (token) => {
            try {
                const rememberMe = localStorage.getItem('rememberMe') === 'true';
                if (rememberMe) {
                    localStorage.setItem('token', token);
                } else {
                    sessionStorage.setItem('token', token);
                }

                await updateUserData();

                const invitationBoardId = localStorage.getItem('invitationBoardId');
                if (invitationBoardId) {
                    localStorage.removeItem('invitationBoardId');
                    navigate(`/accept-invitation?boardId=${invitationBoardId}`, { replace: true });
                    return;
                }
                const params = new URLSearchParams(location.search);
                const state = params.get('state');
                if (state && state.startsWith('invite_')) {
                    const boardId = state.split('_')[1];
                    navigate(`/accept-invitation?boardId=${boardId}`, { replace: true });
                    return;
                }
                const preAuthPath = localStorage.getItem('preAuthPath') || '/home';
                localStorage.removeItem('preAuthPath');
                navigate(preAuthPath, { replace: true });
            } catch (error) {
                console.error('OAuth processing error:', error);
                navigate('/auth/login');
            }
        };

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/auth/login');
            return;
        }

        if (token) {
            handleOAuthSuccess(token);
        } else {
            const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (storedToken) {
                handleOAuthSuccess(storedToken);
            } else {
                navigate('/auth/login');
            }
        }
    }, [navigate, updateUserData, location]);

    return (
        <div className="oauth-redirect-handler">
            <p>Logging you in...</p>
            <div className="loading-spinner"></div>
        </div>
    );
};

export default OAuth2RedirectHandler;