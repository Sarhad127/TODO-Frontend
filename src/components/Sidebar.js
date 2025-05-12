import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import plutoIcon from '../icons/Pluto.png';
import boardsIcon from '../icons/boards.png';
import notesIcon from '../icons/notes.png';
import calenderIcon from '../icons/calender.png';
import scheduleIcon from '../icons/schedule-icon.png';

function Sidebar() {

    useEffect(() => {
        const type = localStorage.getItem('backgroundType');
        const value = localStorage.getItem('backgroundValue');

        if (type === 'color' && value) {
            document.body.style.background = `linear-gradient(to bottom, ${value}, #420b70)`;
        } else if (type === 'image' && value) {
            document.body.style.background = `url(${value}) center/cover no-repeat`;
        }
    }, []);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const predefinedColors = [
        'rgba(110,11,0,0.57)', 'rgba(141,112,0,0.57)', 'rgba(155,147,23,0.57)', 'rgba(64,117,0,0.57)',
        'rgba(0,76,89,0.57)', 'rgba(0,39,103,0.57)', 'rgba(86,17,145,0.57)', 'rgba(140,27,89,0.57)',
        'rgba(22,69,138,0.57)', 'rgba(138,118,28,0.57)', 'rgba(29,141,34,0.57)', 'rgba(37,104,157,0.57)',
        'rgba(24,116,128,0.57)', 'rgba(72,20,115,0.8)', 'rgba(134,49,22,0.57)', 'rgba(133,53,22,0.57)',
        'rgba(53,23,107,0.57)', 'rgba(101,68,18,0.57)', 'rgba(72,114,24,0.57)', 'rgba(20,84,114,0.57)',
    ];

    const toggleDropDown = () => {
        setIsDropdownOpen(prevState => !prevState);
    };

    const applyColor = (color) => {
        document.body.style.background = `linear-gradient(to bottom, ${color}, #420b70)`;
        localStorage.setItem('backgroundType', 'color');
        localStorage.setItem('backgroundValue', color);
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
                    <Link to="/Schedule" className="sidebar-btn">
                        <img src={scheduleIcon} alt="" className="sidebar-icon-small" />
                        Schedule
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
            </ul>
        </div>
    );
}

export default Sidebar;
