import React, { useState, useEffect } from 'react';
import './Navbar.css';
import UserAvatar from '../UserAvatar';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../context/UserContext';
import profileIcon from '../../icons/profile-2.png';
import logoutIcon from '../../icons/logout.png';

const Navbar = ({ onBoardSelect }) => {
    const navigate = useNavigate();
    const [isBoardsDropdownOpen, setIsBoardsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [boards, setBoards] = useState([]);
    const [selectedBoardTitle, setSelectedBoardTitle] = useState('');
    const { userData, updateUserData } = useUser();
    const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [editableTitle, setEditableTitle] = useState('');

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
                if (!selectedBoardTitle && boardsData.length > 0) {
                    setSelectedBoardTitle(boardsData[0].title || `Board ${boardsData[0].position}`);
                }
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

    const handleBoardClick = async (position) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/boards/${position}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const boardData = await response.json();
                setSelectedBoardTitle(boardData.title);
                if (onBoardSelect) {
                    onBoardSelect(position);
                }
            }
        } catch (error) {
            console.error('Error fetching board:', error);
        }
    };

    const renameBoard = async (boardId, newTitle) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:8080/api/boards/${boardId}/title`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTitle })
            });

            if (!response.ok) throw new Error("Rename failed");

            const updatedBoard = await response.json();
            setSelectedBoardTitle(updatedBoard.title);
            setIsRenaming(false);
            setEditableTitle('');
            updateUserData();
        } catch (err) {
            console.error("Rename error:", err);
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
                                        onClick={() => handleBoardClick(board.position)}
                                    >
                                        {board.title || `Board ${board.position}`}
                                    </li>
                                ))
                            ) : (
                                <li className="dropdown-boards">No boards available</li>
                            )}
                            <li className="dropdown-boards-button" onClick={createNewBoard}>
                                <span className="create-new-text-button">Create New Board</span>
                            </li>
                        </ul>
                    )}
                </li>
                {selectedBoardTitle && (
                    <div className="board-settings-wrapper">
                        {isRenaming ? (
                            <input
                                type="text"
                                value={editableTitle}
                                onChange={(e) => setEditableTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const board = boards.find(b => b.title === selectedBoardTitle);
                                        if (board) renameBoard(board.id, editableTitle);
                                    }
                                }}
                                onBlur={() => {
                                    setIsRenaming(false);
                                    setEditableTitle('');
                                }}
                                autoFocus
                                className="rename-input"
                            />
                        ) : (
                            <span className="selected-board-title">{selectedBoardTitle}</span>
                        )}
                        <div className="board-settings-container">
                            <button
                                className="vertical-dots-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSettingsDropdownOpen(!isSettingsDropdownOpen);
                                }}
                            >
                                ⋮
                            </button>
                            {isSettingsDropdownOpen && (
                                <div className="settings-dropdown">
                                    <div
                                        className="dropdown-item"
                                        onClick={() => {
                                            setIsRenaming(true);
                                            setEditableTitle(selectedBoardTitle);
                                            setIsSettingsDropdownOpen(false);
                                        }}
                                    >
                                        Rename Board
                                    </div>
                                    <div className="dropdown-item">Delete Board</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ul>

            <div className="navbar-item-avatar" onClick={toggleUserDropdown}>
                <button className="avatar-button">
                    <UserAvatar />
                </button>
                {isUserDropdownOpen && (
                    <ul className="dropdown-menu user-dropdown">
                        <li className="dropdown-item" onClick={() => navigate('/profile')}>
                            <img src={profileIcon} alt="Profile" className="dropdown-icon-profile" />
                            Profile
                        </li>
                        <li className="dropdown-item" onClick={handleLogout}>
                            <img src={logoutIcon} alt="Logout" className="dropdown-icon-profile" />
                            Logout
                        </li>
                    </ul>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
