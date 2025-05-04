import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './styles/Login.module.css';
import plutoIcon from '../icons/pluto-icon.png';
import googleIcon from '../icons/google-icon.png';
import githubIcon from '../icons/github-icon.png';
import { useUser } from '../context/UserContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { updateUserData } = useUser();

    useEffect(() => {
        const invitationBoardId = localStorage.getItem('invitationBoardId');
        if (invitationBoardId) {
            setErrorMessage(`You have a pending invitation. Please login to accept it.`);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        const loginData = { email, password };

        try {
            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            const responseData = await response.json();

            if (response.ok) {
                const token = responseData.token || responseData;

                if (rememberMe) {
                    localStorage.setItem('token', token);
                } else {
                    sessionStorage.setItem('token', token);
                }

                await updateUserData();
                const invitationBoardId = localStorage.getItem('invitationBoardId') || sessionStorage.getItem('invitationBoardId');
                if (invitationBoardId) {
                    localStorage.removeItem('invitationBoardId');
                    sessionStorage.removeItem('invitationBoardId');
                    navigate(`/accept-invitation?boardId=${invitationBoardId}`);
                } else if (responseData.error === "UNVERIFIED_USER") {
                    navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                } else {
                    navigate('/home');
                }
            } else {
                if (responseData.error === "UNVERIFIED_USER") {
                    navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                } else {
                    setErrorMessage(responseData?.message || responseData?.error || 'Login failed.');
                }
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again later.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        const invitationBoardId =
            localStorage.getItem('invitationBoardId') ||
            sessionStorage.getItem('invitationBoardId');
        let redirectUrl = `http://localhost:8080/oauth2/authorization/${provider}?redirect_uri=http://localhost:3000/oauth2/redirect`;
        if (invitationBoardId) {
            redirectUrl += `&state=invite_${invitationBoardId}`;
        }
        window.location.href = redirectUrl;
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleLogin} className={styles.loginForm}>
                <h2 className={styles.loginTitle}>
                    <img src={plutoIcon} alt="" className={styles.icon} />
                    Pluto
                </h2>
                <h3 className={styles.smallText}>Log in</h3>
                <label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                    />
                </label>
                <label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </label>
                <div className={styles.showPasswordToggle}>
                    <label>
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        Show Password
                    </label>
                </div>
                <div className={styles.showPasswordToggle}>
                    <label>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                        Remember Me
                    </label>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.loginButton}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                {errorMessage && (
                    <div className={errorMessage.includes('pending invitation') ?
                        styles.infoMessage : styles.errorMessage}>
                        {errorMessage}
                    </div>
                )}
            </form>

            <div className={styles.link}>
                <span>Don't have an account? <a href="/auth/register">Sign up</a></span>
            </div>
            <div className={styles.orDivider}>
                <span>----------------------------- or -----------------------------</span>
            </div>

            <div className={styles.oauthButtons}>
                <button
                    onClick={() => handleOAuthLogin('google')}
                    className={`${styles.oauthButton} ${styles.googleButton}`}
                    disabled={isLoading}
                >
                    <img src={googleIcon} alt="Google" className={styles.buttonIcon} />
                    <span>Login with Google</span>
                </button>

                <button
                    onClick={() => handleOAuthLogin('github')}
                    className={`${styles.oauthButton} ${styles.githubButton}`}
                    disabled={isLoading}
                >
                    <img src={githubIcon} alt="Github" className={styles.buttonIcon2} />
                    <span>Login with GitHub</span>
                </button>
            </div>
        </div>
    );
};

export default Login;