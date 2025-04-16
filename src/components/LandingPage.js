import React from 'react';
import { Link } from 'react-router-dom';
import './styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header className="landing-header">
                <h1>Pluto</h1>
                <nav>
                    <div className="dropdown">
                        <button className="dropbtn">Features</button>
                        <div className="dropdown-content">
                            <Link to="/calendar">Calendar</Link>
                            <Link to="/login">Login</Link>
                        </div>
                    </div>
                    <div className="auth-buttons">
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </div>
                </nav>
            </header>
            <main>
                <h2>Welcome to Pluto</h2>
                <p>Your all-in-one productivity space 🚀</p>
            </main>
        </div>
    );
};

export default LandingPage;
