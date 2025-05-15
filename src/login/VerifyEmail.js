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
        <div className={`${styles.ve__container} ve__container`}>
            <h3 className={`${styles.ve__title} ve__title`}>Check your email</h3>
            {error && (
                <div className={`${styles.ve__error} ve__error`}>
                    {error}
                </div>
            )}
            <form
                onSubmit={handleVerification}
                className={`${styles.ve__form} ve__form`}
            >
                <div className={`${styles.ve__inputGroup} ve__inputGroup`}>
                    <input
                        type="text"
                        name="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter Verification Code"
                        required
                        className={`${styles.ve__input} ve__input`}
                    />
                </div>
                <input
                    type="hidden"
                    name="email"
                    value={email}
                    className={`${styles.ve__hiddenInput} ve__hiddenInput`}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`${styles.ve__submitBtn} ve__submitBtn ${isLoading ? styles.ve__submitBtnLoading : ''}`}
                >
                    {isLoading ? (
                        <span className={`${styles.ve__loadingText} ve__loadingText`}>
            Verifying...
          </span>
                    ) : (
                        <span className={`${styles.ve__submitText} ve__submitText`}>
            Verify
          </span>
                    )}
                </button>
            </form>
        </div>
    );
};

export default VerifyEmail;
