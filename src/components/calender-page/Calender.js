import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import './Calendar.css';

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState({}); // Now editable

  const formatDate = (date) => date.toISOString().split('T')[0];

  const handleNoteChange = (dayKey, value) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [dayKey]: value
    }));
  };

  const renderHeader = () => (
      <div className="calendar-header">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>&lt;</button>
        <div>{format(currentMonth, 'MMMM yyyy')}</div>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>&gt;</button>
      </div>
  );

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEE';
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
          <div className="calendar-day-name" key={i}>
            {format(addDays(startDate, i), dateFormat)}
          </div>
      );
    }
    return <div className="calendar-days-row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayKey = formatDate(day);
        const noteValue = notes[dayKey] || '';
        const formattedDate = format(day, 'd');
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const isOutsideMonth = !isSameMonth(day, monthStart);

        days.push(
            <div
                key={dayKey}
                className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isOutsideMonth ? 'outside' : ''}`}
                onClick={() => setSelectedDate(day)}
            >
              <div className="day-number">{formattedDate}</div>
              <textarea
                  value={noteValue}
                  onChange={(e) => handleNoteChange(dayKey, e.target.value)}
                  rows={3}
                  className="note-preview"
                  spellCheck="false"
              />
            </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="calendar-row" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
      <div className="calendar-app">
        <div className="calendar-container">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      </div>
  );
}

export default CalendarPage;
