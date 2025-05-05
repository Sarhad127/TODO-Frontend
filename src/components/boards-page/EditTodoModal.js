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
        ['#FF0000', '#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#FFFF00'],
        ['#FF6347', '#FF69B4', '#FF1493', '#FF00FF', '#DA70D6', '#BA55D3'],
        ['#800080', '#4B0082', '#8A2BE2', '#9370DB', '#7B68EE', '#6A5ACD'],
        ['#0000FF', '#1E90FF', '#00BFFF', '#87CEEB', '#00FFFF', '#40E0D0'],
        ['#008000', '#00FF00', '#32CD32', '#7CFC00', '#ADFF2F', '#9ACD32'],
        ['#006400', '#228B22', '#2E8B57', '#3CB371', '#20B2AA', '#008080']
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
                            {colorGrid.map((row, rowIndex) => (
                                <div key={rowIndex} className="color-row">
                                    {row.map((color, colIndex) => (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className="color-cell"
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleColorSelect(color)}
                                            title={color}
                                        />
                                    ))}
                                </div>
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