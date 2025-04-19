import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar';
import './styles/NotesPage.css';
import UserAvatar from "./UserAvatar";
import colorIcon from '../icons/color-icon.png';
import trashIcon from '../icons/trash-icon.png';
import dateIcon from '../icons/date-icon.png';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const textareaRefs = useRef([]);
    const dropdownRefs = useRef([]);

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
        const savedNotes = localStorage.getItem('notes');
        if (savedNotes) setNotes(JSON.parse(savedNotes));
    }, []);

    useEffect(() => {
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [notes]);

    useEffect(() => {
        textareaRefs.current.forEach((textarea) => {
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        });
    }, [notes]);

    const addNewNote = () => {
        setNotes([...notes, {
            title: 'New Note',
            text: '',
            color: '#ffffff',
            date: '',
        }]);
    };

    const deleteNote = (index) => {
        const updatedNotes = [...notes];
        updatedNotes.splice(index, 1);
        setNotes(updatedNotes);
        setOpenDropdown(null);
    };

    const changeNoteColor = (index, color) => {
        const updatedNotes = [...notes];
        updatedNotes[index].color = color;
        setNotes(updatedNotes);
        setOpenDropdown(null);
    };

    const changeNoteDate = (index, date) => {
        const updatedNotes = [...notes];
        updatedNotes[index].date = date;
        setNotes(updatedNotes);
    };

    const toggleDropdown = (index) => {
        setOpenDropdown(openDropdown === index ? null : index);
    };

    return (
        <div className="app">
            <Sidebar changeBackgroundColor={() => true} />
            <UserAvatar />
            <div>
                <h1 className="notes-title">Notes</h1>
                <div className="notes-grid">
                    {notes.map((note, index) => (
                        <div
                            key={index}
                            className="note"
                            style={{ backgroundColor: note.color }}
                        >
                            <div className="note-header">
                                <input
                                    className="title-input"
                                    value={note.title}
                                    onChange={(e) => {
                                        const updatedNotes = [...notes];
                                        updatedNotes[index].title = e.target.value;
                                        setNotes(updatedNotes);
                                    }}
                                    placeholder="Note title"
                                />
                                <div className="note-actions" ref={el => dropdownRefs.current[index] = el}>
                                    <button
                                        className="dropdown-toggle"
                                        onClick={() => toggleDropdown(index)}
                                    >
                                        ⋮
                                    </button>
                                    {openDropdown === index && (
                                        <div className="dropdown-menu">
                                            <label className="color-text-label">
                                                <img src={colorIcon} alt="Color Icon" className="color-icon" />
                                                Color
                                                <input
                                                    type="color"
                                                    value={note.color}
                                                    onChange={(e) => changeNoteColor(index, e.target.value)}
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
                                                    value={note.date}
                                                    onChange={(e) => changeNoteDate(index, e.target.value)}
                                                    className="date-input"
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <textarea
                                ref={(el) => (textareaRefs.current[index] = el)}
                                value={note.text}
                                onChange={(e) => {
                                    const updatedNotes = [...notes];
                                    updatedNotes[index].text = e.target.value;
                                    setNotes(updatedNotes);
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="Start typing your note..."
                            />
                        </div>
                    ))}

                    <button className="add-note-btn" onClick={addNewNote}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;