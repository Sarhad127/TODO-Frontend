// src/components/OAuth2RedirectHandler.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log('OAuth2RedirectHandler mounted');

        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        console.log('URL params:', { token, error });

        if (token) {
            console.log('OAuth2 login successful, token received');
            localStorage.setItem('token', token);

            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);

            // Redirect to home or original path
            const redirectPath = localStorage.getItem('preAuthPath') || '/home';
            localStorage.removeItem('preAuthPath');
            console.log('Redirecting to:', redirectPath);
            navigate(redirectPath);
        } else if (error) {
            console.error('OAuth2 login failed:', error);
            navigate('/auth/login', { state: { error: `OAuth login failed: ${error}` } });
        } else {
            console.error('No token or error parameter found');
            navigate('/auth/login', { state: { error: 'Authentication failed' } });
        }
    }, [navigate]);

    return <div>Processing OAuth2 login...</div>;
};

export default OAuth2RedirectHandler;