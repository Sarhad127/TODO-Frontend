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

    // Extract email from URL parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const emailFromUrl = queryParams.get('email');
        console.log('Extracted email from URL:', emailFromUrl);  // Log email
        if (emailFromUrl) {
            setEmail(emailFromUrl);
        }
    }, [location]);

    const handleVerification = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        console.error(`Encoded email: ${encodeURIComponent(email)}`);  // Log the email
        const verificationData = { email, verificationCode };
        console.log('Email to verify:', email);

        try {
            // Changed to use query parameters as your backend expects
            const response = await fetch(`http://localhost:8080/auth/verify?email=${encodeURIComponent(email)}&verificationCode=${encodeURIComponent(verificationCode)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const responseData = await response.text(); // First get the raw response

            if (response.ok) {
                navigate('/auth/login'); // Changed to common login route
            } else {
                // Try to parse as JSON if possible, otherwise use the raw text
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
