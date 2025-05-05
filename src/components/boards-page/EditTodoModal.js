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
        const text = e.target.value.slice(0, 5);
        setSelectedTodo({
            ...selectedTodo,
            tag: {
                ...selectedTodo.tag,
                text
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
                    <h4>Tag (max 5 chars)</h4>
                    <input
                        type="text"
                        value={selectedTodo.tag?.text || ''}
                        onChange={handleTagTextChange}
                        maxLength={5}
                        placeholder="Tag (5 chars)"
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