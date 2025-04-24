import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import plutoIcon from './icons/pluto-icon.png';

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/auth/login');
    };

    const handleBackgroundChange = () => {
        document.body.style.backgroundColor = document.body.style.backgroundColor === 'lightblue' ? 'purple' : 'lightblue';
    };

    return (
        <div className="sidebar">
            <h2 className="sidebar-icon">
                <img src={plutoIcon} alt="Pluto Icon" />
                Pluto
            </h2>

            <div className="tasks-title">
                <h2>TASKS</h2>
            </div>

            <ul>
                <li>
                    <Link to="/home" className="sidebar-btn">
                        Boards
                    </Link>
                </li>
                <li>
                    <Link to="/calendar" className="sidebar-btn">
                        Calendar
                    </Link>
                </li>
                <li>
                    <Link to="/notes" className="sidebar-btn">
                        Notes
                    </Link>
                </li>

                <div className="tasks-title">
                    <h2>SETTINGS</h2>
                </div>
                <li>
                    <button className="sidebar-settings-styles" onClick={handleBackgroundChange}>
                        Change Background
                    </button>
                </li>
                <li>
                    <button className="sidebar-settings-styles" onClick={handleLogout}>
                         Logout
                    </button>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;
