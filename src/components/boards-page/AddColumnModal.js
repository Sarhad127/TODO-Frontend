import React from 'react';

export function AddColumnModal({
                                   setNewColumnTitle,
                                   saveNewColumn,
                                   cancelAddColumn
                               }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Add Column</h2>
                <input
                    type="text"
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Enter new column title"
                    autoFocus
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