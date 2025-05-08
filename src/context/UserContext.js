import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = useCallback(async (token) => {
        try {
            const response = await fetch('email-verification-production.up.railway.app/api/userdata', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? 'Unauthorized' : 'Failed to fetch user data');
            }

            const data = await response.json();
            setUserData(data);
            setError(null);
        } catch (err) {
            console.error('User data fetch error:', err);
            setError(err.message);
            setUserData(null);

            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }
        fetchUserData(token);
    }, [fetchUserData]);

    const updateUserData = useCallback(async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            await fetchUserData(token);
        }
    }, [fetchUserData]);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUserData(null);
    }, []);

    return (
        <UserContext.Provider value={{
            userData,
            setUserData,
            loading,
            error,
            updateUserData,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};