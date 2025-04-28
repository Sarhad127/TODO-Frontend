import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Login.module.css';
import plutoIcon from '../icons/pluto-icon.png';
import googleIcon from '../icons/google-icon.png';
import githubIcon from '../icons/github-icon.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

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
                    console.log('Token stored in localStorage:', localStorage.getItem('token'));
                } else {
                    sessionStorage.setItem('token', token);
                    console.log('Token stored in sessionStorage:', sessionStorage.getItem('token'));
                }

                const userDataResponse = await fetch('http://localhost:8080/api/userdata', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const userData = await userDataResponse.json();
                navigate('/home', { state: { userData } });
                console.log(userData)
            } else {
                if (responseData.error === "UNVERIFIED_USER") {
                    navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
                } else {
                    setErrorMessage(responseData?.message || responseData?.error || 'Login failed.');
                }
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthLogin = (provider) => {
        const currentPath = window.location.pathname;
        localStorage.setItem('preAuthPath', currentPath);

        const redirectUrl = `http://localhost:8080/oauth2/authorization/${provider}?redirect_uri=http://localhost:3000/oauth2/redirect`;
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
                {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
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
                    <img
                        src={googleIcon}
                        alt="Google"
                        className={styles.buttonIcon}
                    />
                    <span>Login with Google</span>
                </button>

                <button
                    onClick={() => handleOAuthLogin('github')}
                    className={`${styles.oauthButton} ${styles.githubButton}`}
                    disabled={isLoading}
                >
                    <img
                        src={githubIcon}
                        alt="Github"
                        className={styles.buttonIcon2}
                    />
                    <span>Login with GitHub</span>
                </button>
            </div>
        </div>
    );
};

export default Login;
