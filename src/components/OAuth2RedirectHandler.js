import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndNavigateWithUserData = async (token) => {
            try {
                const userDataResponse = await fetch('http://localhost:8080/api/userdata', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (userDataResponse.ok) {
                    const userData = await userDataResponse.json();
                    const preAuthPath = localStorage.getItem('preAuthPath') || '/home';
                    localStorage.removeItem('preAuthPath');

                    const rememberMe = localStorage.getItem('rememberMe') === 'true';
                    if (rememberMe) {
                        localStorage.setItem('token', token);
                    } else {
                        sessionStorage.setItem('token', token);
                    }

                    navigate(preAuthPath, {
                        state: { userData },
                        replace: true
                    });
                } else {
                    console.error('Failed to fetch user data');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
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
            fetchAndNavigateWithUserData(token);
        } else {
            const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (storedToken) {
                fetchAndNavigateWithUserData(storedToken);
            } else {
                navigate('/login');
            }
        }
    }, [navigate]);

    return <p>Logging you in...</p>;
};

export default OAuth2RedirectHandler;