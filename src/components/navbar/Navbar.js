import React, {useState, useEffect, useRef} from 'react';
import './Navbar.css';
import UserAvatar from '../UserAvatar';
import { useNavigate } from "react-router-dom";
import { useUser } from '../../context/UserContext';
import profileIcon from '../../icons/profile-2.png';
import logoutIcon from '../../icons/logout.png';
import tasksIcon from '../../icons/tasks.png'
import friendsIcon from '../../icons/friends.png'
import friendsSubmit from '../../icons/friend-submit.png'
import ChatBox from "../boards-page/ChatBox";

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
    const [isFriendsDropdownOpen, setIsFriendsDropdownOpen] = useState(false);
    const [friendEmail, setFriendEmail] = useState('');
    const toggleFriendsDropdown = () => setIsFriendsDropdownOpen(!isFriendsDropdownOpen);
    const [currentBoardId, setCurrentBoardId] = useState(null);
    const [boardUsers, setBoardUsers] = useState([]);
    const { userEmail } = useUser();
    const [username, setUsername] = useState('');
    const settingsDropdownRef = useRef(null);
    const dropdownRef = useRef(null);
    const boardsDropdownRef = useRef(null);
    const friendsDropdownRef = useRef(null);
    const toggleBoardsDropdown = () => setIsBoardsDropdownOpen(!isBoardsDropdownOpen);
    const toggleUserDropdown = () => {
        setIsUserDropdownOpen((prev) => !prev);
    };
    const [avatarData, setAvatarData] = useState({
        backgroundColor: '#3f51b5',
        initials: '',
        imageUrl: ''
    });

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    console.error("No token found");
                    return;
                }
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const currentUsername = decoded.sub || decoded.username;
                setUsername(currentUsername);

                const userResponse = await fetch('https://email-verification-production.up.railway.app/api/user/avatar', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setAvatarData({
                        backgroundColor: userData.avatarBackgroundColor || '#3f51b5',
                        initials: userData.avatarInitials || '',
                        imageUrl: userData.avatarImageUrl || ''
                    });
                }

                const response = await fetch('https://email-verification-production.up.railway.app/api/boards', {
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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isUserDropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsUserDropdownOpen(false);
            }

            if (
                isBoardsDropdownOpen &&
                boardsDropdownRef.current &&
                !boardsDropdownRef.current.contains(event.target)
            ) {
                setIsBoardsDropdownOpen(false);
            }

            if (
                isSettingsDropdownOpen &&
                settingsDropdownRef.current &&
                !settingsDropdownRef.current.contains(event.target)
            ) {
                setIsSettingsDropdownOpen(false);
            }

            if (
                isFriendsDropdownOpen &&
                friendsDropdownRef.current &&
                !friendsDropdownRef.current.contains(event.target)
            ) {
                setIsFriendsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [
        isUserDropdownOpen,
        isBoardsDropdownOpen,
        isSettingsDropdownOpen,
        isFriendsDropdownOpen,
    ]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/auth/login');
    };

    const createNewBoard = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.error("No token found");
                return;
            }
            const existingBoardNumbers = boards
                .map(board => {
                    const match = board.title?.match(/Board (\d+)/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => !isNaN(num));

            const highestNumber = existingBoardNumbers.length > 0
                ? Math.max(...existingBoardNumbers)
                : 0;

            const newBoardNumber = highestNumber + 1;
            const newBoardPosition = (userData && userData.boardPosition) ? userData.boardPosition + 1 : 1;

            const newBoard = {
                position: newBoardPosition,
                title: `Board ${newBoardNumber}`,
            };

            const response = await fetch('https://email-verification-production.up.railway.app/api/boards', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBoard),
            });
            const createdBoard = await response.json();
            updateUserData();
            setSelectedBoardTitle(createdBoard.title || `Board ${createdBoard.position}`);
            if (onBoardSelect) {
                onBoardSelect(createdBoard.position);
            }
            setIsBoardsDropdownOpen(false);
        } catch (error) {
            console.error("Error creating board:", error);
        }
    };

    const handleBoardClick = async (position) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                console.error("No authentication token found");
                return;
            }
            const boardResponse = await fetch(`https://email-verification-production.up.railway.app/api/boards/${position}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!boardResponse.ok) {
                console.error(`Board fetch failed with status: ${boardResponse.status}`);
                const errorData = await boardResponse.text();
                console.error('Error details:', errorData);
                return;
            }

            const boardData = await boardResponse.json();
            setCurrentBoardId(boardData.id);
            console.log('Board data:', boardData);
            setSelectedBoardTitle(boardData.title);

            setBoardUsers([]);

            const usersResponse = await fetch(`https://email-verification-production.up.railway.app/api/boards/${boardData.id}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (usersResponse.status === 204) {
                console.log("This board has no other users (204 No Content)");
            } else if (!usersResponse.ok) {
                console.error(`Users fetch failed with status: ${usersResponse.status}`);
                const errorData = await usersResponse.text();
                console.error('Error details:', errorData);
            } else {
                const usersData = await usersResponse.json();
                setBoardUsers(usersData);
            }
            if (onBoardSelect) {
                onBoardSelect(position);
            }
        } catch (error) {
            console.error('Error in handleBoardClick:', error);
            if (error.response) {
                console.error('Response error:', await error.response.text());
            }
        }
    };

    const renameBoard = async (boardId, newTitle) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`https://email-verification-production.up.railway.app/api/boards/${boardId}/title`, {
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

    const deleteBoard = async () => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this board?");
            if (!confirmDelete) return;

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const board = boards.find(b => b.title === selectedBoardTitle);
            if (board && board.position === 1) {
                alert("You cannot delete the board at position 1.");
                return;
            }
            if (!token || !board) return;

            const response = await fetch(`https://email-verification-production.up.railway.app/api/boards/${board.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Delete failed');
            const boardsResponse = await fetch('https://email-verification-production.up.railway.app/api/boards', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!boardsResponse.ok) throw new Error('Failed to fetch updated boards');
            const updatedBoards = await boardsResponse.json();
            setBoards(updatedBoards);
            if (updatedBoards.length > 0) {
                setSelectedBoardTitle(updatedBoards[0].title || `Board ${updatedBoards[0].position}`);
                if (onBoardSelect) {
                    onBoardSelect(updatedBoards[0].position);
                }
            } else {
                setSelectedBoardTitle('');
            }
            setIsSettingsDropdownOpen(false);
            updateUserData();
        } catch (error) {
            console.error('Error deleting board:', error);
            alert('Failed to delete board: ' + error.message);
        }
    };

    const handleAddFriend = async () => {
        console.log('Adding friend with email:', friendEmail);

        const selectedBoard = boards.find(board => board.title === selectedBoardTitle);
        const boardId = selectedBoard?.id;
        if (!boardId) {
            alert('No board selected or board ID not found.');
            return;
        }
        if (selectedBoard.position === 1) {
            alert('You cannot invite users to the first board.');
            return;
        }
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('https://email-verification-production.up.railway.app/api/invitations/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    boardId: boardId,
                    inviteeEmail: friendEmail
                })
            });

            if (response.ok) {
                alert('Invitation sent!');
                setFriendEmail('');
            } else {
                const errorData = await response.json();
                alert('Failed to send invitation: ' + (errorData.message || response.status));
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
            alert('Something went wrong.');
        }
    };

    const leaveGroup = async () => {
        if (!currentBoardId) {
            alert("No board selected.");
            return;
        }

        const confirmLeave = window.confirm("Are you sure you want to leave this group?");
        if (!confirmLeave) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`https://email-verification-production.up.railway.app/api/boards/${currentBoardId}/leave`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                updateUserData();
                window.location.reload();
            } else {
                const error = await response.text();
                alert("Failed to leave group: " + error);
            }
        } catch (err) {
            console.error("Error leaving group:", err);
            alert("Something went wrong.");
        }
    };

    return (
        <nav className="navbar">
            <ul className="navbar-buttons">
                <li className="boards-item" ref={boardsDropdownRef} onClick={toggleBoardsDropdown}>
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
                                        <img
                                            src={tasksIcon}
                                            alt="Board"
                                            className="board-icon"
                                            style={{ width: '16px', height: '16px', marginRight: '8px' }}
                                        />
                                        {board.title || `Board ${board.position}`}
                                    </li>
                                ))
                            ) : (
                                <li className="dropdown-boards">No boards available</li>
                            )}
                            <li className="dropdown-boards-button" onClick={createNewBoard}>
                                <span className="create-new-text-button">Add Board</span>
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
                        <div className="board-settings-container" ref={settingsDropdownRef}>
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
                                <div className="settings-dropdown" >
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
                                    <div className="dropdown-item" onClick={deleteBoard}>
                                        Delete Board
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="board-members-display">
                    {boardUsers.length > 0 && (
                        <div className="user-list">
                            {boardUsers.map((user, index) => (
                                <div
                                    key={index}
                                    className="user-avatar-container"
                                    data-tooltip={user.username}
                                >
                                    <div
                                        className="user-avatar"
                                        style={{
                                            backgroundColor: user.avatarBackgroundColor || '#3f51b5',
                                            backgroundImage: user.avatarImageUrl ? `url(${user.avatarImageUrl})` : 'none',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {!user.avatarImageUrl && (user.avatarInitials || user.username.substring(0, 2).toUpperCase())}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ul>
            {currentBoardId && boardUsers.length > 0 && <ChatBox boardId={currentBoardId} />}
            <div className="testing-icon-removal">
            {boardUsers.length > 0 && currentBoardId && (
                <img
                    src={logoutIcon}
                    alt="Leave Group"
                    title="Leave Group"
                    className="leave-group-icon"
                    onClick={leaveGroup}
                />
            )}
            </div>
            <div className="friends-dropdown-wrapper" ref={friendsDropdownRef}>
                <img
                    src={friendsIcon}
                    alt="Friends Icon"
                    className="friends-icon"
                    onClick={toggleFriendsDropdown}
                />
                {isFriendsDropdownOpen && (
                    <ul className="dropdown-menu friends-dropdown">
                        <li className="dropdown-item-friends">
                            <div className="email-input-wrapper">
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="Add email to given board"
                                    value={friendEmail}
                                    onChange={(e) => setFriendEmail(e.target.value)}
                                />
                                <button className="email-submit-button" onClick={handleAddFriend}>
                                    <img src={friendsSubmit} alt="Submit" className="submit-icon" />
                                </button>
                            </div>
                        </li>
                    </ul>
                )}
            </div>
            <div className="navbar-item-avatar" onClick={toggleUserDropdown}>
                <button className="avatar-button">
                    <UserAvatar
                        backgroundColor={avatarData.backgroundColor}
                        initials={avatarData.initials || (username ? username.substring(0, 2).toUpperCase() : '')}
                        imageUrl={avatarData.imageUrl}
                        size="small"
                    />
                </button>
                {isUserDropdownOpen && (
                    <ul ref={dropdownRef} className="dropdown-menu user-dropdown">
                        <div className="avatar-dropdown-header">
                            <UserAvatar size="large" showName={true} />
                            <div className="avatar-user-info">
                                {username && <p className="user-username">{username}</p>}
                                {userEmail && <p className="user-email">{userEmail}</p>}
                            </div>
                        </div>
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
