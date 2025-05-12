import React, { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from 'date-fns';
import './Calendar.css';

function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);
  const textareaRefs = useRef({});
  const menuRefs = useRef({});
  const [cellColors, setCellColors] = useState({});
  const [textColors, setTextColors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);

  const colorOptions = [
    { bg: '#c93939', text: '#ffffff' },
    { bg: '#ffbb98', text: '#000000' },
    { bg: '#fdfdb8', text: '#000000' },
    { bg: '#b9ffb9', text: '#000000' },
    { bg: '#b3ffff', text: '#000000' },
    { bg: '#b4d1ff', text: '#000000' },
    { bg: '#d3a8ff', text: '#000000' },
    { bg: '', text: '#000000' }
  ];

  const handleDayClick = (day) => {
    setSelectedDate(new Date(day));
    setModalOpen(true);
  };

  useEffect(() => {
  }, [selectedDate]);

  const handleColorChange = (dayKey, bgColor, textColor) => {
    const newColors = {
      ...cellColors,
      [dayKey]: bgColor
    };
    const newTextColors = {
      ...textColors,
      [dayKey]: textColor
    };
    setCellColors(newColors);
    setTextColors(newTextColors);
    setActiveMenu(null);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return format(d, 'yyyy-MM-dd');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && menuRefs.current[activeMenu] && !menuRefs.current[activeMenu].contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

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
        const colorsMap = {};
        const textColorsMap = {};
        data.forEach(note => {
          const dateKey = formatDate(new Date(note.date));
          notesMap[dateKey] = note.content;
          if (note.color) {
            colorsMap[dateKey] = note.color;
          }
          if (note.textColor) {
            textColorsMap[dateKey] = note.textColor;
          }
        });
        setNotes(notesMap);
        setCellColors(colorsMap);
        setTextColors(textColorsMap);
      } catch (error) {
        console.error('Error fetching calendar notes:', error);
      }
    };

    fetchNotes();
  }, []);

  const handleNoteChange = (dayKey, value) => {
    setNotes(prevNotes => ({
      ...prevNotes,
      [dayKey]: value
    }));
  };

  const saveNote = async (dayKey, bgColor = cellColors[dayKey] || '', textColor = textColors[dayKey] || '#000000') => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const noteDTO = {
        date: dayKey,
        content: notes[dayKey] || '',
        color: bgColor,
        textColor: textColor
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

  const deleteNote = async (dayKey) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8080/api/calendar/${dayKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete calendar note');
      }

      setNotes(prev => {
        const updated = { ...prev };
        delete updated[dayKey];
        return updated;
      });
      setCellColors(prev => {
        const updated = { ...prev };
        delete updated[dayKey];
        return updated;
      });
      setTextColors(prev => {
        const updated = { ...prev };
        delete updated[dayKey];
        return updated;
      });

      setModalOpen(false);
      console.log('Note deleted for', dayKey);
    } catch (error) {
      console.error('Error deleting calendar note:', error);
    }
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
        const cloneDay = day;
        const dayKey = formatDate(day);
        const noteValue = notes[dayKey] || '';
        const formattedDate = format(day, 'd');
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const isOutsideMonth = !isSameMonth(day, monthStart);
        const cellColor = cellColors[dayKey] || '';
        const textColor = textColors[dayKey] || '#000000';

        days.push(
            <div
                key={dayKey}
                className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isOutsideMonth ? 'outside' : ''}`}
                onClick={() => handleDayClick(cloneDay)}
                style={{
                  backgroundColor: cellColor,
                  color: textColor
                }}
            >
              <div className="day-number">{formattedDate}</div>
              <textarea
                  ref={el => textareaRefs.current[dayKey] = el}
                  value={noteValue}
                  onChange={(e) => handleNoteChange(dayKey, e.target.value)}
                  rows={3}
                  className="note-preview"
                  spellCheck="false"
                  style={{ color: textColor }}
              />
              <div className="day-menu-container">
                {activeMenu === dayKey && (
                    <div
                        ref={el => menuRefs.current[dayKey] = el}
                        className="day-menu-dropup"
                    >
                      <div className="color-options-grid">
                        {colorOptions.map((color, index) => (
                            <button
                                key={index}
                                className={`color-option ${color.bg === '' ? 'clear-option' : ''}`}
                                style={{
                                  backgroundColor: color.bg,
                                  color: color.text,
                                  border: `1px solid ${color.text}`
                                }}
                                onClick={() => handleColorChange(dayKey, color.bg, color.text)}
                            >
                              {color.bg === '' && <span>×</span>}
                            </button>
                        ))}
                      </div>
                    </div>
                )}
              </div>
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

        {modalOpen && selectedDate && (
            <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{format(new Date(selectedDate), 'MMMM d, yyyy')}</h2>
                <div className="modal-content">
                  <div className="form-group">
                    <textarea
                        value={notes[formatDate(selectedDate)] || ''}
                        onChange={(e) => handleNoteChange(formatDate(selectedDate), e.target.value)}
                        style={{
                          color: textColors[formatDate(selectedDate)] || '#000000',
                          backgroundColor: cellColors[formatDate(selectedDate)] || 'transparent'
                        }}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cell Color</label>
                    <div className="color-options-grid">
                      {colorOptions.map((color, index) => (
                          <button
                              key={index}
                              className={`color-option ${color.bg === '' ? 'clear-option' : ''}`}
                              style={{
                                backgroundColor: color.bg,
                                color: color.text,
                                border: `1px solid ${color.text}`
                              }}
                              onClick={() => {
                                handleColorChange(
                                    formatDate(selectedDate),
                                    color.bg,
                                    color.text
                                );
                              }}
                          >
                            {color.bg === '' && <span>×</span>}
                          </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Text Color</label>
                    <div className="color-options-grid">
                      {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map((color, index) => (
                          <button
                              key={`text-${index}`}
                              className="color-option"
                              style={{
                                backgroundColor: color,
                                color: getContrastColor(color)
                              }}
                              onClick={() => {
                                const dayKey = formatDate(selectedDate);
                                const newTextColors = {
                                  ...textColors,
                                  [dayKey]: color
                                };
                                setTextColors(newTextColors);
                              }}
                          >
                            Aa
                          </button>
                      ))}
                    </div>
                    <div className="modal-actions">
                      <button
                          className="save-btn"
                          onClick={() => {
                            saveNote(
                                formatDate(selectedDate),
                                cellColors[formatDate(selectedDate)] || '',
                                textColors[formatDate(selectedDate)] || '#000000'
                            );
                            setModalOpen(false);
                          }}
                      >
                        Save & Close
                      </button>
                      <button
                          className="delete-btn"
                          onClick={() => deleteNote(formatDate(selectedDate))}
                      >
                        Delete
                      </button>
                      <button
                          className="cancel-btn"
                          onClick={() => setModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

function getContrastColor(hexColor) {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default CalendarPage;