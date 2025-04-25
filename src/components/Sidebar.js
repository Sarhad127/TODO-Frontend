import React from 'react';
import {Link, useNavigate} from 'react-router-dom';
import plutoIcon from '../icons/pluto-icon.png';
import boardsIcon from '../icons/boards.png';
import notesIcon from '../icons/notes.png';
import calenderIcon from '../icons/calender.png';

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
            <h2 className="sidebar-icon-pluto">
                <img src={plutoIcon} alt="Pluto Icon" />
                Pluto
            </h2>

            <ul>
                <div className="tasks-title-first">
                    <h2>TASKS</h2>
                </div>
                <li>
                    <Link to="/home" className="sidebar-btn">
                        <img src={boardsIcon} alt="" className="sidebar-icon-small" />
                        Dashboard
                    </Link>
                </li>
                <li>
                    <Link to="/calendar" className="sidebar-btn">
                        <img src={notesIcon} alt="" className="sidebar-icon-small" />
                        Calendar
                    </Link>
                </li>
                <li>
                    <Link to="/notes" className="sidebar-btn">
                        <img src={calenderIcon} alt="" className="sidebar-icon-small" />
                        Notes
                    </Link>
                </li>

                <div className="tasks-title-second">
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
