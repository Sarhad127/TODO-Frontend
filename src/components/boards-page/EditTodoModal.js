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
                <div className="live-preview-section">
                    <div
                        className="todo-item-preview"
                        style={{
                            backgroundColor: selectedTodo.color,
                            padding: '8px',
                            borderRadius: '6px',
                            boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                            marginTop: '8px',
                            position: 'relative',
                        }}
                    >
                        {selectedTodo.tag?.color && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 4,
                                    left: 4,
                                    width: 40,
                                    height: 9,
                                    backgroundColor: selectedTodo.tag.color,
                                    borderRadius: '4px',
                                }}
                            />
                        )}
                        <div style={{ paddingTop: selectedTodo.tag?.color ? 12 : 0 }}>
                            <strong
                                style={{
                                    display: 'inline-block',
                                    maxWidth: '220px',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {selectedTodo.text}
                            </strong>


                            {(selectedTodo.tag?.text || selectedTodo.tag?.avatarInitials || selectedTodo.tag?.avatarImageUrl) && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: '6px',
                                        fontSize: '10px',
                                        color: '#666',
                                    }}
                                >
                                    {(selectedTodo.tag.avatarImageUrl || selectedTodo.tag.avatarInitials) && (
                                        <div
                                            style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: '50%',
                                                backgroundColor: selectedTodo.tag.avatarBackgroundColor || '#ccc',
                                                backgroundImage: selectedTodo.tag.avatarImageUrl
                                                    ? `url(${selectedTodo.tag.avatarImageUrl})`
                                                    : 'none',
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                marginRight: 6,
                                            }}
                                        >
                                            {!selectedTodo.tag.avatarImageUrl && selectedTodo.tag.avatarInitials}
                                        </div>
                                    )}
                                    {selectedTodo.tag.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="board-users-container">
                    {boardUsers.length > 1 && boardUsers.map(user => (
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
                <div className="due-date-section">
                    <h4>Due Date</h4>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="datetime-local"
                            value={
                                selectedTodo && selectedTodo.dueDate && !isNaN(new Date(selectedTodo.dueDate))
                                    ? new Date(
                                        new Date(selectedTodo.dueDate).getTime() -
                                        new Date().getTimezoneOffset() * 60000
                                    )
                                        .toISOString()
                                        .slice(0, 16)
                                    : ''
                            }
                            onChange={(e) =>
                                selectedTodo &&
                                setSelectedTodo({
                                    ...selectedTodo,
                                    dueDate: e.target.value,
                                })
                            }
                            style={{ paddingRight: '4rem', flex: 1 }}
                        />
                        <button
                            type="button"
                            onClick={() =>
                                selectedTodo &&
                                setSelectedTodo({
                                    ...selectedTodo,
                                    dueDate: '',
                                })
                            }
                            style={{
                                position: 'absolute',
                                right: '0.5rem',
                                padding: '0.3rem 0.6rem',
                                background: '#eee',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                            }}
                        >
                            Clear
                        </button>
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