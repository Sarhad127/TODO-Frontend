import React from 'react';
import { FaTrash } from 'react-icons/fa';

export function AddColumnModal({ setNewColumnTitle, saveNewColumn, cancelAddColumn }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add New Column</h2>
                <input
                    type="text"
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter new column title"
                />
                <div className="modal-buttons">
                    <button onClick={saveNewColumn}>Add Column</button>
                    <button className="cancel-btn" onClick={cancelAddColumn}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export function EditModal({ selectedTodo, setSelectedTodo, saveChanges, deleteTodo, changeColumnTitle, cancelAddTodo }) {
    if (!selectedTodo) return null;

    const isNewTodo = selectedTodo.isNew;
    const isTitleChange = selectedTodo.isTitleChange;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{isNewTodo ? 'Add New To-Do' : isTitleChange ? 'Change Column Title' : 'Edit To-Do'}</h2>
                {isTitleChange ? (
                    <>
                        <input
                            type="text"
                            value={selectedTodo.text}
                            onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
                            placeholder="Enter new column title"
                        />
                        <input
                            type="color"
                            value={selectedTodo.color}
                            onChange={(e) => setSelectedTodo({ ...selectedTodo, color: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button onClick={saveChanges}>Save</button>
                            <button className="cancel-btn" onClick={cancelAddTodo}>Cancel</button>
                        </div>
                    </>
                ) : isNewTodo ? (
                    <>
                        <input
                            type="text"
                            value={selectedTodo.text}
                            onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
                            placeholder="Enter Todo text"
                        />
                        <input
                            type="color"
                            value={selectedTodo.color}
                            onChange={(e) => setSelectedTodo({ ...selectedTodo, color: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button onClick={saveChanges}>Add</button>
                            <button className="cancel-btn" onClick={cancelAddTodo}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <input
                            type="text"
                            value={selectedTodo.text}
                            onChange={(e) => setSelectedTodo({ ...selectedTodo, text: e.target.value })}
                        />
                        <input
                            type="color"
                            value={selectedTodo.color}
                            onChange={(e) => setSelectedTodo({ ...selectedTodo, color: e.target.value })}
                        />
                        <div className="modal-buttons">
                            <button onClick={saveChanges}>Save</button>
                            <button className="delete-btn" onClick={() => deleteTodo(selectedTodo)}>
                                <FaTrash /> Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}