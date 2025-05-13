import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import './NotesPage.css';
import colorIcon from '../../icons/color-icon.png';
import trashIcon from '../../icons/trash-icon.png';
import dateIcon from '../../icons/date-icon.png';
import {AiOutlinePlus} from "react-icons/ai";

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

    const [showColorPalette, setShowColorPalette] = useState(false);
    const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');

                const response = await fetch('http://localhost:8080/api/notes', {
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

    useEffect(() => {
        textareaRefs.current.forEach((textarea) => {
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        });
    }, [notes]);

    const saveNote = async (index) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const noteToUpdate = notes[index];
            const updatedNote = { ...noteToUpdate };

            const response = await fetch(`http://localhost:8080/api/notes/${noteToUpdate.id}`, {
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

            const response = await fetch('http://localhost:8080/api/notes', {
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

    const deleteNote = async (index) => {
        try {
            const noteToDelete = notes[index];
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const response = await fetch(`http://localhost:8080/api/notes/${noteToDelete.id}`, {
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

    const handleTitleChange = (index, value) => {
        const updatedNotes = [...notes];
        updatedNotes[index].title = value;
        setNotes(updatedNotes);
    };

    const handleTextChange = (index, value) => {
        const updatedNotes = [...notes];
        updatedNotes[index].text = value;
        setNotes(updatedNotes);
    };

    const handleColorChange = (index, color) => {
        const updatedNotes = [...notes];
        updatedNotes[index].color = color;
        setNotes(updatedNotes);
        setOpenDropdown(null);
    };

    const handleDateChange = (index, date) => {
        const updatedNotes = [...notes];
        updatedNotes[index].date = date;
        setNotes(updatedNotes);
    };

    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
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
                        <div className="note-header">
                            {/*<input*/}
                            {/*    className="title-input"*/}
                            {/*    value={note.title || ''}*/}
                            {/*    onChange={(e) => handleTitleChange(index, e.target.value)}*/}
                            {/*    placeholder="Note"*/}
                            {/*/>*/}
                            <div className="note-actions" ref={el => dropdownRefs.current[index] = el}>
                                {/*<button*/}
                                {/*    className="dropdown-toggle"*/}
                                {/*    onClick={() => toggleDropdown(index)}*/}
                                {/*>*/}
                                {/*    ⋮*/}
                                {/*</button>*/}
                                {openDropdown === index && (
                                    <div className="dropdown-menu-notes">
                                        <label className="color-text-label">
                                            <img src={colorIcon} alt="Color Icon" className="color-icon" />
                                            Color
                                            <input
                                                type="color"
                                                value={note.color || '#ffffff'}
                                                onChange={(e) => handleColorChange(index, e.target.value)}
                                                className="hidden-color-input"
                                            />
                                        </label>
                                        <label className="delete-option" onClick={() => deleteNote(index)}>
                                            <img src={trashIcon} alt="Delete Note" className="delete-icon" />
                                            Delete Note
                                        </label>
                                        <label className="date-option">
                                            <img src={dateIcon} alt="Date Icon" className="date-icon" />
                                            Date
                                            <input
                                                type="date"
                                                value={note.date || ''}
                                                onChange={(e) => handleDateChange(index, e.target.value)}
                                                className="date-input"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>
                        <textarea
                            ref={(el) => (textareaRefs.current[index] = el)}
                            value={note.text || ''}
                            onChange={(e) => handleTextChange(index, e.target.value)}
                            placeholder="Start typing your note..."
                            spellCheck="false"
                        />
                        <button onClick={() => saveNote(index)} className="save-text-btn">Save</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotesPage;
