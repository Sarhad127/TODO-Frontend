import React, { useState, useEffect } from 'react';
import './Navbar.css';
import UserAvatar from '../UserAvatar';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../context/UserContext';

const Navbar = () => {
    const navigate = useNavigate();
    const [isBoardsDropdownOpen, setIsBoardsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [boards, setBoards] = useState([]);

    const { userData, updateUserData } = useUser();

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    console.error("No token found");
                    return;
                }

                const response = await fetch('http://localhost:8080/api/boards', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch boards');
                }

                const boardsData = await response.json();
                setBoards(boardsData);
            } catch (error) {
                console.error('Error fetching boards:', error);
            }
        };

        if (userData) {
            fetchBoards();
        }
    }, [userData]);

    const toggleBoardsDropdown = () => setIsBoardsDropdownOpen(!isBoardsDropdownOpen);
    const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        console.log('token removed');
        navigate('/auth/login');
    };

    const createNewBoard = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.error("No token found");
                return;
            }

            const newBoardPosition = (userData && userData.boardPosition) ? userData.boardPosition + 1 : 1;

            const newBoard = {
                position: newBoardPosition,
                title: `New Board ${newBoardPosition}`,
            };

            const response = await fetch('http://localhost:8080/api/boards', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBoard),
            });

            if (!response.ok) {
                throw new Error('Failed to create a new board');
            }

            const createdBoard = await response.json();
            console.log('Created new board:', createdBoard);
            updateUserData();
        } catch (error) {
            console.error("Error creating board:", error);
        }
    };

    return (
        <nav className="navbar">
            <ul className="navbar-buttons">
                <li className="boards-item" onClick={toggleBoardsDropdown}>
                    <button className="navbar-button">
                        Boards <span className="dropdown-arrow">{isBoardsDropdownOpen ? '▲' : '▼'}</span>
                    </button>
                    {isBoardsDropdownOpen && (
                        <ul className="dropdown-menu boards-dropdown">
                            {boards && boards.length > 0 ? (
                                boards.map((board) => (
                                    <li
                                        key={board.id}
                                        className={`dropdown-boards ${board.position === userData.boardPosition ? 'default-board' : ''}`}
                                    >
                                        {board.title || `Board ${board.position}`}
                                    </li>
                                ))
                            ) : (
                                <li className="dropdown-boards">No boards available</li>
                            )}
                            <li className="dropdown-boards" onClick={createNewBoard}>
                                <button>Create New Board</button>
                            </li>
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
                        <li className="dropdown-item" onClick={() => navigate('/profile')}>Profile</li>
                        <li className="dropdown-item" onClick={handleLogout}>Logout</li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
