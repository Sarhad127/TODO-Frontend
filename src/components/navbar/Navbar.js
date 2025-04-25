import React, { useState } from 'react';
import './Navbar.css';
import UserAvatar from '../UserAvatar';

const Navbar = () => {
    const [isBoardsDropdownOpen, setIsBoardsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const toggleBoardsDropdown = () => setIsBoardsDropdownOpen(!isBoardsDropdownOpen);
    const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

    return (
        <nav className="navbar">
            <ul className="navbar-buttons">

                <li className="boards-item" onClick={toggleBoardsDropdown}>
                    <button className="navbar-button">
                        Boards <span className="dropdown-arrow">{isBoardsDropdownOpen ? '▲' : '▼'}</span>
                    </button>
                    {isBoardsDropdownOpen && (
                        <ul className="dropdown-menu">
                            <li className="dropdown-item">Option 1</li>
                            <li className="dropdown-item">Option 2</li>
                            <li className="dropdown-item">Option 3</li>
                        </ul>
                    )}
                </li>
            </ul>

                <div className="navbar-item-avatar" onClick={toggleUserDropdown}>
                    <button className="avatar-button">
                        <UserAvatar />
                    </button>
                    {isUserDropdownOpen && (
                        <ul className="dropdown-menu user-dropdown">
                            <li className="dropdown-item">Profile</li>
                            <li className="dropdown-item">Logout</li>
                        </ul>
                    )}
                </div>
        </nav>
    );
};

export default Navbar;