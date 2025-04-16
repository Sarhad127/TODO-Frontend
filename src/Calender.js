import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import './components/styles/App.css'; // Import your main CSS file for consistent styling

function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({}); // Store events with dates as keys (e.g., "2025-03-04")
  const [note, setNote] = useState(""); // Store the text for the notes section

  // Function to handle text input for a specific date
  const handleEventChange = (e, day) => {
    const updatedEvents = { ...events, [day]: e.target.value };
    setEvents(updatedEvents);
  };

  // Function to handle note input
  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  // Format the selected date to "YYYY-MM-DD" for easy comparison
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]; // e.g., "2025-03-04"
  };

  // Render events (text) for each day inside a container
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
            tileContent={({ date, view }) => renderEvents(date)} // Add events inside day containers
          />
        </div>

        {/* Notes Column */}
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
