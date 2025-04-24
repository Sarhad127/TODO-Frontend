import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import UserAvatar from "./UserAvatar";
import './styles/Calendar.css';

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes] = useState({});

  const formatDate = (date) => date.toISOString().split('T')[0];

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
        const noteData = notes[dayKey];
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
              <div>{formattedDate}</div>
              {noteData && <div className="note-preview">{noteData.title}</div>}
            </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="calendar-row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  return (
      <div className="calendar-app">
        <UserAvatar />
        <h1 className="calendar-title">Calendar</h1>
        <div className="calendar-container">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      </div>
  );
}

export default CalendarPage;
