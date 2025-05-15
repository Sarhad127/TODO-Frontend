import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/Register.module.css';

const Register = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const type = localStorage.getItem('backgroundType');
        const value = localStorage.getItem('backgroundValue');

        if (type === 'color' && value) {
            document.body.style.background = `linear-gradient(to bottom, ${value}, #420b70)`;
        } else if (type === 'image' && value) {
            document.body.style.background = `url(${value}) center/cover no-repeat`;
        }
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const registerData = { email, username, password };

        try {
            const response = await fetch('https://email-verification-production.up.railway.app/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData),
            });

            if (response.ok) {
                navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`);
            } else {
                const errorData = await response.text();
                setError(errorData || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
        }
    };

    return (
        <div className={styles.formContainer}>
            <h2 className={styles.registerTitle}>Sign up</h2>
            <h3 className={styles.smallText}>Create a free account!</h3>
            <p className={styles.emailConfirmationText}>We'll send you a verification code to confirm your email</p>

            <form onSubmit={handleRegister}>
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
                        type="mycustom"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                </label>
                <label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                    />
                </label>
                <label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        required
                    />
                </label>


                <button type="submit" className={styles.signupButton}>Sign up</button>
                {error && <div className={styles.errorMessage}>{error}</div>}
            </form>
            <div className={styles.link}>
                <span>Already have an account? <a href="/auth/login">Login</a></span>
            </div>
        </div>
    );
};

export default Register;
