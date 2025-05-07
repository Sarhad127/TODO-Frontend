import React from 'react';
import { FaTrash } from 'react-icons/fa';

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

    const colorGrid = [
        '#FF5733', '#FFC300', '#33FF57', '#33C1FF', '#FF33A8', '#9D33FF',
        '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251',
        '#B565A7', '#009B77', '#DD4124', '#45B8AC', '#EFC050', '#5B5EA6',
        '#9B2335', '#BC243C'
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
                />
                <input
                    type="color"
                    value={selectedTodo.color}
                    onChange={(e) => setSelectedTodo({
                        ...selectedTodo,
                        color: e.target.value
                    })}
                />

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
                        <h5>Choose a tag color:</h5>
                        <div className="color-grid">
                            {colorGrid.map((color, index) => (
                                <div
                                    key={index}
                                    className="color-cell"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorSelect(color)}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="selected-color-preview">
                        Selected:
                        <div
                            className="color-preview"
                            style={{ backgroundColor: selectedTodo.tag?.color || '#ffffff' }}
                        />
                        <input
                            type="color"
                            value={selectedTodo.tag?.color || '#ffffff'}
                            onChange={(e) => setSelectedTodo({
                                ...selectedTodo,
                                tag: {
                                    ...selectedTodo.tag,
                                    color: e.target.value
                                }
                            })}
                        />
                    </div>
                </div>

                <div className="modal-buttons">
                    <button onClick={saveChanges}>Save</button>
                    <button className="delete-btn" onClick={() => deleteTodo(selectedTodo)}>
                        <FaTrash /> Delete
                    </button>
                    <button className="cancel-btn" onClick={cancelAddTodo}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}