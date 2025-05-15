import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import './NotesPage.css';
import { AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";

const COLOR_PALETTE = [
    '#a47a34',
    '#9f5832',
    '#5b3088',
    '#E2F0CB',
    '#2d70c2',
    '#5f8d2f'
];

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const textareaRefs = useRef([]);
    const dropdownRefs = useRef([]);
    const [editableNotes, setEditableNotes] = useState([]);

    const [showColorPalette, setShowColorPalette] = useState(false);
    const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const response = await fetch('https://email-verification-production.up.railway.app/api/notes', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch notes');
                }

                const data = await response.json();
                setNotes(data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRefs.current.some(ref =>
                ref && ref.contains(event.target)
            )) return;
            setOpenDropdown(null);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const saveNote = async (index) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const noteToUpdate = notes[index];
            const updatedNote = { ...noteToUpdate };

            const response = await fetch(`https://email-verification-production.up.railway.app/api/notes/${noteToUpdate.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updatedNote),
            });

            if (!response.ok) {
                throw new Error('Failed to update note');
            }

            const savedNote = await response.json();
            setNotes(prevNotes => {
                const newNotes = [...prevNotes];
                newNotes[index] = savedNote;
                return newNotes;
            });
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    const addNewNote = async (color = selectedColor) => {
        const newNote = {
            title: 'New Note',
            text: '',
            color: color,
            date: new Date().toISOString().split('T')[0],
        };

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch('https://email-verification-production.up.railway.app/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newNote),
            });

            if (!response.ok) {
                throw new Error('Failed to create note');
            }

            const savedNote = await response.json();
            setNotes(prevNotes => [...prevNotes, savedNote]);
            setShowColorPalette(false);
        } catch (error) {
            console.error('Error creating note:', error);
        }
    };

    const toggleColorPalette = () => {
        setShowColorPalette(!showColorPalette);
    };

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        addNewNote(color);
    };

    const toggleEditMode = (index) => {
        setEditableNotes(prev => {
            const newEditable = [...prev];
            newEditable[index] = !newEditable[index];
            return newEditable;
        });
    };

    const handleBlur = (index) => {
        saveNote(index);
        toggleEditMode(index);
    };

    const deleteNote = async (index) => {
        try {
            const noteToDelete = notes[index];
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`https://email-verification-production.up.railway.app/api/notes/${noteToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete note');
            }

            setNotes(prevNotes => prevNotes.filter((_, i) => i !== index));
            setOpenDropdown(null);
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleTextChange = (index, value) => {
        const updatedNotes = [...notes];
        updatedNotes[index].text = value;
        setNotes(updatedNotes);
    };

    if (loading) {
        return <div className="notesPage-app">Loading notes...</div>;
    }

    return (
        <div className="notesPage-app">
            <Sidebar changeBackgroundColor={() => true} />
            <div className="notes-title">
                Notes
                <div className="add-note-container">
                    <button
                        className="add-note-btn"
                        onClick={toggleColorPalette}
                        aria-label="Add Note"
                    >
                        <AiOutlinePlus />
                    </button>
                    {showColorPalette && (
                        <div className="color-palette">
                            {COLOR_PALETTE.map((color, index) => (
                                <button
                                    key={index}
                                    className="color-option"
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorSelect(color)}
                                    aria-label={`Select color ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="notes-grid">
                {notes.map((note, index) => (
                       <div
                            key={note.id || index}
                            className="note"
                            style={{ backgroundColor: note.color }}
                        >
                       <textarea
                           className={`note-textarea ${editableNotes[index] ? 'editable' : ''}`}
                           ref={(el) => {
                               textareaRefs.current[index] = el;
                               if (editableNotes[index] && el) {
                                   setTimeout(() => el.focus(), 0);
                               }
                           }}
                           value={note.text || ''}
                           placeholder={editableNotes[index] ? "Start typing..." : ""}
                           onChange={(e) => handleTextChange(index, e.target.value)}
                           spellCheck="false"
                           readOnly={!editableNotes[index]}
                           onBlur={() => {
                               if (editableNotes[index]) {
                                   handleBlur(index);
                               }
                           }}
                       />
                           <div className="note-controls">
                                <button
                                        className="delete-note-btn"
                                        onClick={() => {
                                        const confirmed = window.confirm('Are you sure you want to delete this note?');
                                        if (confirmed) {
                                        deleteNote(index);
                                        }
                                        }}
                                        aria-label="Delete note"
                                        >
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            transform: 'rotate(90deg) scaleX(0.6)',
                                            fontSize: '1rem',
                                            lineHeight: '1',
                                          }}
                                           >
                                          |
                                    </span>
                                </button>
                                <button
                                    className="edit-note-btn"
                                    onClick={() => toggleEditMode(index)}
                                    >
                                    <AiOutlineEdit className="edit-icon" />
                                </button>
                           </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesPage;
