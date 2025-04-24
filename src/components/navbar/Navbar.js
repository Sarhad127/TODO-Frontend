import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
    const [isDropdownOpen2, setIsDropdownOpen2] = useState(false);

    const toggleDropdown1 = () => setIsDropdownOpen1(!isDropdownOpen1);
    const toggleDropdown2 = () => setIsDropdownOpen2(!isDropdownOpen2);

    return (
        <nav className="navbar">
            <ul className="navbar-menu">
                {/* Dropdown 1 */}
                <li className="navbar-item" onClick={toggleDropdown1}>
                    <button className="navbar-button">Dropdown 1</button>
                    {isDropdownOpen1 && (
                        <ul className="dropdown-menu">
                            <li className="dropdown-item">Option 1</li>
                            <li className="dropdown-item">Option 2</li>
                            <li className="dropdown-item">Option 3</li>
                        </ul>
                    )}
                </li>

                {/* Dropdown 2 */}
                <li className="navbar-item" onClick={toggleDropdown2}>
                    <button className="navbar-button">Dropdown 2</button>
                    {isDropdownOpen2 && (
                        <ul className="dropdown-menu">
                            <li className="dropdown-item">Option A</li>
                            <li className="dropdown-item">Option B</li>
                            <li className="dropdown-item">Option C</li>
                        </ul>
                    )}
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
