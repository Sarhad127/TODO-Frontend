import React, { useState } from 'react';
import './Navbar.css';
import UserAvatar from '../UserAvatar';

const Navbar = () => {
    const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);

    const toggleDropdown1 = () => setIsDropdownOpen1(!isDropdownOpen1);

    return (
        <nav className="navbar">
            <ul className="navbar-menu">

                <li className="navbar-item" onClick={toggleDropdown1}>
                    <button className="navbar-button">
                        Boards <span className="dropdown-arrow">{isDropdownOpen1 ? '▲' : '▼'}</span>
                    </button>
                    {isDropdownOpen1 && (
                        <ul className="dropdown-menu">
                            <li className="dropdown-item">Option 1</li>
                            <li className="dropdown-item">Option 2</li>
                            <li className="dropdown-item">Option 3</li>
                        </ul>
                    )}
                </li>
            </ul>
            <div>
                <UserAvatar />
            </div>
        </nav>
    );
};

export default Navbar;
