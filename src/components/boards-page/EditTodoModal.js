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

    const isNewTodo = selectedTodo.isNew;
    const isTitleChange = selectedTodo.isTitleChange;

    const modalTitle = isNewTodo
        ? 'Add New To-Do'
        : isTitleChange
            ? 'Change Column Title'
            : 'Edit To-Do';

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{modalTitle}</h2>
                <input
                    type="text"
                    value={selectedTodo.text}
                    onChange={(e) => setSelectedTodo({
                        ...selectedTodo,
                        text: e.target.value
                    })}
                    placeholder={
                        isTitleChange
                            ? "Enter new column title"
                            : "Enter Todo text"
                    }
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
                <div className="modal-buttons">
                    <button onClick={saveChanges}>
                        {isNewTodo ? 'Add' : 'Save'}
                    </button>
                    {!isTitleChange && !isNewTodo && (
                        <button
                            className="delete-btn"
                            onClick={() => deleteTodo(selectedTodo)}
                        >
                            <FaTrash /> Delete
                        </button>
                    )}
                    <button className="cancel-btn" onClick={cancelAddTodo}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}