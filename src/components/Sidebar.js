import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import plutoIcon from '../icons/pluto-icon.png';
import boardsIcon from '../icons/boards.png';
import notesIcon from '../icons/notes.png';
import calenderIcon from '../icons/calender.png';

function Sidebar() {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const predefinedColors = [
        '#f28b82', '#fbbc04', '#fff475', '#ccff90', '#a7ffeb',
        '#cbf0f8', '#aecbfa', '#d7aefb', '#fdcfe8', '#e6c9a8',
        '#e8eaed', '#fdd835', '#81c784', '#64b5f6', '#9575cd',
        '#4dd0e1', '#7986cb', '#ff8a65', '#a1887f', '#90a4ae',
        '#b39ddb', '#ffcc80', '#c5e1a5', '#b0bec5', '#dce775'
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        console.log('token removed');
        navigate('/auth/login');
    };

    const toggleDropDown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };

    const applyColor = (color) => {
        document.body.style.background = `linear-gradient(to bottom, ${color}, #f0f0f0)`;
        setIsDropdownOpen(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            document.body.style.background = `url(${imageUrl}) center/cover no-repeat`;
            setIsDropdownOpen(false);
        }
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
                <li onClick={toggleDropDown}>
                    <button className="sidebar-settings-styles">
                        Change Background
                    </button>
                </li>
                {isDropdownOpen && (
                    <div className="color-grid">
                        {predefinedColors.map((color, index) => (
                            <div
                                key={index}
                                className="color-swatch"
                                style={{ backgroundColor: color }}
                                onClick={() => applyColor(color)}
                            />
                        ))}
                        <div className="upload-wrapper">
                            <label htmlFor="bg-upload" className="upload-btn">
                                Upload image
                            </label>
                            <input
                                id="bg-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>
                )}
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
