import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './components/styles/App.css'
import UserAvatar from "./components/UserAvatar";

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState({});
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentNote, setCurrentNote] = useState("");

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleTitleChange = (e) => {
    setCurrentTitle(e.target.value);
  };

  const handleNoteChange = (e) => {
    setCurrentNote(e.target.value);
  };

  const handleSaveNote = () => {
    const day = formatDate(date);
    setNotes(prev => ({
      ...prev,
      [day]: {
        title: currentTitle,
        note: currentNote,
      }
    }));
    setCurrentTitle("");
    setCurrentNote("");
  };

  const renderTileContent = ({ date }) => {
    const day = formatDate(date);
    const noteData = notes[day];
    return (
        <div className="day-container">
          {noteData && <div className="note-preview">{noteData.title}</div>}
        </div>
    );
  };

  return (
      <div className="calendar-page">
        <UserAvatar />
        <div style={{ display: 'flex', width: '100%' }}>
          <div className="calendar-container">
            <Calendar
                onChange={setDate}
                value={date}
                tileContent={renderTileContent}
            />
          </div>

          <div className="notes-container">
            <h2>Notes for {date.toDateString()}</h2>

            <input
                type="text"
                value={currentTitle}
                onChange={handleTitleChange}
                placeholder="Enter title here..."
            />

            <textarea
                value={currentNote}
                onChange={handleNoteChange}
                placeholder="Write your note here..."
            />

            <button onClick={handleSaveNote}>Save Note</button>
          </div>
        </div>

        <p>Selected Date: {date.toDateString()}</p>
      </div>
  );
}

export default CalendarPage;
