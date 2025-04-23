import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {

            localStorage.setItem('token', token);
            const preAuthPath = localStorage.getItem('preAuthPath') || '/home';
            localStorage.removeItem('preAuthPath');
            navigate(preAuthPath, { replace: true });

        } else {
            const storedToken = localStorage.getItem('token');

            if (storedToken) {
                navigate('/home');
            } else {
                navigate('/login');
            }
        }
    }, [navigate]);

    return <p>Logging you in...</p>;
};

export default OAuth2RedirectHandler;
