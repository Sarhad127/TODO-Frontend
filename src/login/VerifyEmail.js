import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles/VerifyEmail.module.css';

const VerifyEmail = () => {
    const [verificationCode, setVerificationCode] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailFromUrl = queryParams.get('email');
        console.log('Extracted email from URL:', emailFromUrl);
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }
    }, [location]);

    const handleVerification = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`https://email-verification-production.up.railway.app/auth/verify?email=${encodeURIComponent(email)}&verificationCode=${encodeURIComponent(verificationCode)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const responseData = await response.text();

            if (response.ok) {
                navigate('/auth/login');
            } else {
                try {
                    const errorData = JSON.parse(responseData);
                    setError(errorData.message || 'Verification failed. Please try again.');
                } catch {
                    setError(responseData || 'Verification failed. Please try again.');
                }
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.formContainer}>
            <h3 className={styles.verifyEmailText}>Check your email</h3>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <form onSubmit={handleVerification}>
                <div className={styles.formGroup}>
                    <div className={styles.inputFieldText}>
                        <input
                            type="text"
                            name="verificationCode"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter Verification Code"
                            required
                        />
                    </div>
                </div>
                <input type="hidden" name="email" value={email} />
                <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </div>
    );
};

export default VerifyEmail;
