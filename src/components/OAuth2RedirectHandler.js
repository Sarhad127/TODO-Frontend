import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
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

                const preAuthPath = localStorage.getItem('preAuthPath') || '/home';
                localStorage.removeItem('preAuthPath');
                navigate(preAuthPath, { replace: true });
            } catch (error) {
                console.error('OAuth processing error:', error);
                navigate('/login');
            }
        };

        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            console.error('OAuth error:', error);
            navigate('/login');
            return;
        }

        if (token) {
            handleOAuthSuccess(token);
        } else {
            const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (storedToken) {
                handleOAuthSuccess(storedToken);
            } else {
                navigate('/login');
            }
        }
    }, [navigate, updateUserData]);

    return <div className="oauth-redirect-handler">
        <p>Logging you in...</p>
    </div>;
};

export default OAuth2RedirectHandler;