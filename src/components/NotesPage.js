import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import Sidebar from '../Sidebar';
import './styles/NotesPage.css';

const NotesPage = () => {
    const [backgroundColor, setBackgroundColor] = useState('#ffffff');
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [notes, setNotes] = useState([
        { title: 'Sample Note', text: 'This is a sample note.', color: '#ffffff' },
    ]);
    const [showAddColumnModal, setShowAddColumnModal] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [noteText, setNoteText] = useState('');
    const [noteColor, setNoteColor] = useState('#ffffff');

    const changeBackgroundColor = (color) => {
        setBackgroundColor(color);
        setBackgroundImage(null);
    };

    const changeBackgroundImage = (imageUrl) => {
        setBackgroundImage(imageUrl);
        setBackgroundColor('transparent');
    };

    const addNote = () => {
        if (!noteTitle || !noteText) {
            alert('Please provide both a title and text for the note!');
            return;
        }
        const newNote = { title: noteTitle, text: noteText, color: noteColor };
        setNotes([...notes, newNote]);
        setNoteTitle('');
        setNoteText('');
        setNoteColor('#ffffff');
    };

    const mainContentStyle = {
        backgroundColor: backgroundImage ? 'transparent' : backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="app">
            <Sidebar changeBackgroundColor={() => setShowAddColumnModal(true)} />
            <div className="main-content" style={mainContentStyle}>
                <h1>Pluto - Notes</h1>
                <div className="columns">
                    {/* Display Notes in Columns */}
                    <div className="note-column">
                        <h2>Notes</h2>
                        <div className="note-input">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                            />
                            <textarea
                                placeholder="Note Text"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                            />
                            <input
                                type="color"
                                value={noteColor}
                                onChange={(e) => setNoteColor(e.target.value)}
                            />
                            <button onClick={addNote}>Add Note</button>
                        </div>
                        <div className="notes-container">
                            {notes.map((note, index) => (
                                <div
                                    key={index}
                                    className="note"
                                    style={{ backgroundColor: note.color }}
                                >
                                    <h3>{note.title}</h3>
                                    <p>{note.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        className="note-column transparent"
                        onClick={() => setShowAddColumnModal(true)}
                    >
                        <FaPlus size={40} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
