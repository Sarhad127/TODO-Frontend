import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaEllipsisH } from 'react-icons/fa';

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


function Sidebar({ changeBackgroundColor }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
      <div className="sidebar">
        <div className="logo-container">
          <span className="pluto-icon">Pluto</span>
        </div>

        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Search" />
          <FaSearch className="search-icon" />
        </div>

        <div className="tasks-title">
          <h2>TASKS</h2>
        </div>

        <ul>
          <li>
            <Link to="/home" className="sidebar-btn">
              <FaBars /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/calendar" className="sidebar-btn">
              <FaBars /> Calendar
            </Link>
          </li>
          <li>
            <Link to="/notes" className="sidebar-btn">
              <FaBars /> Notes
            </Link>
          </li>
          {/*<li>*/}
          {/*  <button className="sidebar-btn" onClick={changeBackgroundColor}>*/}
          {/*    <FaBars /> Change Background*/}
          {/*  </button>*/}
          {/*</li>*/}
          {/*<li>*/}
          {/*  <Link to="/login" className="sidebar-btn">*/}
          {/*    <FaBars /> Login*/}
          {/*  </Link>*/}
          {/*</li>*/}
        </ul>
        <div className="sidebar-btn-bottom">
          <li>
            <button className="sidebar-btn-settings">
              <FaBars /> Settings
            </button>
          </li>
          <li>
            <button className="sidebar-btn-settings" onClick={handleLogout}>
              <FaBars /> Logout
            </button>
          </li>
        </div>
      </div>
  );
}

export default Sidebar;
