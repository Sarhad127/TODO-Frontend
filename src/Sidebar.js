import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Add routing
import { FaBars } from 'react-icons/fa';
import { FaEllipsisH } from 'react-icons/fa';

// ColumnSettingsDropdown component
export function ColumnSettingsDropdown({ columnName, removeColumn }) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="column-settings">
      <FaEllipsisH size={20} onClick={toggleDropdown} />
      {isDropdownVisible && (
        <div className="dropdown-menu">
          <button onClick={() => removeColumn(columnName)}>Remove Column</button>
        </div>
      )}
    </div>
  );
}

// Sidebar component
function Sidebar({ changeBackgroundColor }) {
  return (
    <div className="sidebar">
      <div className="logo-container">
        <span className="pluto-text">Pluto</span>
        <img 
          src={require('./images/pluto-icon.png')} 
          alt="Pluto Icon" 
          className="pluto-icon" 
        />
      </div>
      <ul>
      <hr className="sidebar-line" />
        <li>
          <Link to="/" className="sidebar-btn">
            <FaBars /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/calendar" className="sidebar-btn">
            <FaBars /> Calendar
          </Link>
        </li>
        <li>
          <button className="sidebar-btn">
            <FaBars /> Settings
          </button>
        </li>
        <li>
          <button className="sidebar-btn">
            <FaBars /> Logout
          </button>
        </li>
        <li>
          <button className="sidebar-btn" onClick={changeBackgroundColor}>
            <FaBars /> Change Background
          </button>
        </li>
        <li>
          <Link to="/login" className="sidebar-btn">
            <FaBars /> Login
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
