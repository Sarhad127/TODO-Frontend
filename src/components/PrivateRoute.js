import React from 'react';
import { Navigate } from 'react-router-dom';

const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const decodedToken = token ? decodeToken(token) : null;

    const isAuthenticated = token && decodedToken && decodedToken.exp > Date.now() / 1000;

    return isAuthenticated ? children : <Navigate to="/auth/login" />;
};

export default PrivateRoute;
