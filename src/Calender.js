import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './components/styles/App.css';

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [note, setNote] = useState("");

  const handleEventChange = (e, day) => {
    const updatedEvents = { ...events, [day]: e.target.value };
    setEvents(updatedEvents);
  };

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const renderEvents = (date) => {
    const day = formatDate(date);
    return (
      <div className="day-container">
        {events[day] ? (
          <input
            type="text"
            value={events[day] || ''}
            onChange={(e) => handleEventChange(e, day)}
            placeholder="Add an event"
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="calendar-page">
      <h1>Calendar</h1>
      <div style={{ display: 'flex', width: '100%' }}>
        <div className="calendar-container">
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={({ date, view }) => renderEvents(date)}
          />
        </div>

        <div className="notes-container">
          <h2>Notes</h2>
          <textarea
            value={note}
            onChange={handleNoteChange}
            placeholder="Write your notes here..."
          />
        </div>
      </div>
      <p>Selected Date: {date.toDateString()}</p>
    </div>
  );
}

export default CalendarPage;
