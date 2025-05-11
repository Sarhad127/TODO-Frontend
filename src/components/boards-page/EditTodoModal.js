import React from 'react';

export function EditModal({
                              selectedTodo,
                              setSelectedTodo,
                              saveChanges,
                              deleteTodo,
                              cancelAddTodo
                          }) {
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

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Edit Card</h3>
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
                                    className={`color-option ${selectedTodo.tag?.color === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                        setSelectedTodo({
                                            ...selectedTodo,
                                            tag: {
                                                ...selectedTodo.tag,
                                                color
                                            }
                                        })
                                    }
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-buttons">
                    <button className="save-btn" onClick={saveChanges}>Save</button>
                    <button className="delete-btn" onClick={() => deleteTodo(selectedTodo)}>
                        Delete
                    </button>
                    <button className="cancel-btn" onClick={cancelAddTodo}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}