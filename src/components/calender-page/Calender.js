import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import './Calendar.css';

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState({});
  const [lastEditedDay, setLastEditedDay] = useState(null);
  const textareaRefs = useRef({});

  const formatDate = (date) => date.toISOString().split('T')[0];

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:8080/api/calendar', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch calendar notes');
        }

        const data = await response.json();
        const notesMap = {};
        data.forEach(note => {
          const dateKey = formatDate(new Date(note.date));
          notesMap[dateKey] = note.content;
        });
        setNotes(notesMap);
      } catch (error) {
        console.error('Error fetching calendar notes:', error);
      }
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    if (lastEditedDay && notes[lastEditedDay] !== undefined) {
      saveNote(lastEditedDay);
    }
  }, [lastEditedDay, notes]);

  const handleNoteChange = (dayKey, value) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [dayKey]: value
    }));
  };

  const saveNote = async (dayKey) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const noteContent = notes[dayKey];
      const noteDTO = {
        date: dayKey,
        content: noteContent || ''
      };

      const response = await fetch('http://localhost:8080/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(noteDTO),
      });

      if (!response.ok) {
        throw new Error('Failed to save calendar note');
      }

      const savedNote = await response.json();
      console.log('Note saved:', savedNote);
    } catch (error) {
      console.error('Error saving calendar note:', error);
    }
  };

  const handleTextareaBlur = (dayKey) => {
    setLastEditedDay(dayKey);
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
                  ref={el => textareaRefs.current[dayKey] = el}
                  value={noteValue}
                  onChange={(e) => handleNoteChange(dayKey, e.target.value)}
                  onBlur={() => handleTextareaBlur(dayKey)}
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