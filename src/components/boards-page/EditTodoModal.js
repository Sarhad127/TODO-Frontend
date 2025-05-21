import React, { useEffect, useRef } from 'react';
import UserAvatar from "../UserAvatar";

export function EditModal({
                              selectedTodo,
                              setSelectedTodo,
                              saveChanges,
                              deleteTodo,
                              cancelAddTodo,
                              boardUsers
                          }) {

    const EditTodoModal = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (EditTodoModal.current && !EditTodoModal.current.contains(event.target)) {
                cancelAddTodo();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!selectedTodo) return null;

    const handleTagTextChange = (e) => {
        const text = e.target.value.slice(0, 30);
        setSelectedTodo({
            ...selectedTodo,
            tag: {
                ...selectedTodo.tag,
                text
            }
        });
    };

    const handleAvatarClick = async (user) => {
        const isSelected = isAvatarSelected(user);

        if (isSelected) {
            setSelectedTodo({
                ...selectedTodo,
                tag: {
                    ...selectedTodo.tag,
                    avatarBackgroundColor: null,
                    avatarImageUrl: null,
                    avatarInitials: null,
                    avatarUsername: null,
                },
                avatarBackgroundColor: null,
                avatarImageUrl: null,
                avatarInitials: null,
                avatarUsername: null,
            });
            return;
        }

        const updatedTodo = {
            ...selectedTodo,
            tag: {
                ...selectedTodo.tag,
                text: selectedTodo.tag?.text || '',
                color: selectedTodo.tag?.color || null,
                avatarBackgroundColor: user.avatarBackgroundColor,
                avatarImageUrl: user.avatarImageUrl,
                avatarInitials: user.avatarInitials,
                avatarUsername: user.username
            },
            avatarBackgroundColor: user.avatarBackgroundColor,
            avatarImageUrl: user.avatarImageUrl,
            avatarInitials: user.avatarInitials,
            avatarUsername: user.username
        };

        setSelectedTodo(updatedTodo);
    };

    const COLOR_OPTIONS = [
        '#f3f3f3',
        '#7a77be',
        '#c75dea',
        '#dc6b6b',
        '#97cc83',
        '#e3d974',
        '#48cc91',
        '#a8a8a8',
        '#d24949'
    ];

    const colorGrid = [
        null,
        '#7a77be',
        '#c75dea',
        '#dc6b6b',
        '#97cc83',
        '#e3d974',
        '#48cc91',
        '#a8a8a8',
        '#d24949'
    ];

    const handleColorSelect = (color) => {
        setSelectedTodo({
            ...selectedTodo,
            tag: {
                ...selectedTodo.tag,
                color
            }
        });
    };

    const isAvatarSelected = (user) => {
        if (!selectedTodo || !user) return false;

        const todoAvatar = {
            username: selectedTodo.avatarUsername || selectedTodo.tag?.avatarUsername,
            initials: selectedTodo.avatarInitials || selectedTodo.tag?.avatarInitials,
            bgColor: selectedTodo.avatarBackgroundColor || selectedTodo.tag?.avatarBackgroundColor,
            imageUrl: selectedTodo.avatarImageUrl || selectedTodo.tag?.avatarImageUrl
        };

        const normalize = (str) => String(str || '').trim().toLowerCase();

        const usernameMatch = normalize(todoAvatar.username) === normalize(user.username);
        const initialsMatch = normalize(todoAvatar.initials) === normalize(user.avatarInitials);
        const colorMatch = normalize(todoAvatar.bgColor) === normalize(user.avatarBackgroundColor);
        const imageMatch = normalize(todoAvatar.imageUrl) === normalize(user.avatarImageUrl);

        if (usernameMatch) return true;

        const bothInitialsAndColorMatch =
            !!todoAvatar.initials &&
            !!todoAvatar.bgColor &&
            initialsMatch &&
            colorMatch;

        if (bothInitialsAndColorMatch) return true;

        if (imageMatch && (initialsMatch || usernameMatch)) return true;

        return false;
    };

    return (
        <div className="modal-overlay">
            <div className="modal" ref={EditTodoModal}>
                <h3>Edit Card</h3>
                <div className="board-users-container">
                    {boardUsers.length > 0 && boardUsers.map(user => (
                        <button
                            key={user.userId}
                            className={`avatar-button-tag ${isAvatarSelected(user) ? 'selected-avatar' : ''}`}
                            onClick={() => handleAvatarClick(user)}
                            aria-label={`Select ${user.username} as assignee`}
                        >
                            <UserAvatar
                                size="small"
                                userData={user}
                                isSelected={isAvatarSelected(user)}
                                showSelectionIndicator={true}
                            />
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    value={selectedTodo.text}
                    onChange={(e) => setSelectedTodo({
                        ...selectedTodo,
                        text: e.target.value
                    })}
                    placeholder="Enter Todo text"
                    autoFocus
                    className="new-task-input"
                    spellCheck={false}
                />
                <div className="color-options">
                    {COLOR_OPTIONS.map((color, index) => (
                        <div
                            key={index}
                            className={`color-option ${selectedTodo.color === color ? 'selected' : ''}`}
                            style={{ backgroundColor: color }}
                            onClick={() =>
                                setSelectedTodo({
                                    ...selectedTodo,
                                    color
                                })
                            }
                        />
                    ))}
                </div>

                <div className="tag-section">
                    <h4>Tag (max 30 chars)</h4>
                    <input
                        type="text"
                        value={selectedTodo.tag?.text || ''}
                        onChange={handleTagTextChange}
                        maxLength={30}
                        placeholder="Tag (30 chars)"
                    />
                    <div className="color-grid-container">
                        <div className="color-options">
                            {colorGrid.map((color, index) => (
                                <div
                                    key={index}
                                    className={`color-option ${selectedTodo.tag?.color === color ? 'selected' : ''} ${
                                        color === null ? 'null-option' : ''
                                    }`}
                                    style={{
                                        backgroundColor: color || 'transparent',
                                        border: color === null ? '2px dashed #ccc' : 'none'
                                    }}
                                    onClick={() => handleColorSelect(color)}
                                    title={color === null ? "No tag color" : color}
                                >
                                    {color === null && (
                                        <span className="null-label">×</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-buttons-todoBoard">
                    <button className="save-btn-todoBoard" onClick={saveChanges}>Save</button>
                    <button className="delete-btn-todoBoard" onClick={() => deleteTodo(selectedTodo)}>
                        Delete
                    </button>
                    <button className="cancel-btn-todoBoard" onClick={cancelAddTodo}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}