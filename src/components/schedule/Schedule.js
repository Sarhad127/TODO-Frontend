import React, {useEffect, useState} from 'react';
import './SchedulePage.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 9 }, (_, i) => 8 + i);

function SchedulePage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedHour, setSelectedHour] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [formData, setFormData] = useState({
        start: '',
        end: '',
        label: '',
        title: '',
        color: '#f3f3f3'
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('scheduleBlocks');
        if (saved) setBlocks(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (blocks.length > 0) {
            localStorage.setItem('scheduleBlocks', JSON.stringify(blocks));
        }
    }, [blocks]);

    const openModal = (day, hour, index = null) => {
        setEditingIndex(index);
        if (index !== null) {
            setFormData({
                ...blocks[index],
                start: blocks[index].start.toString(),
                end: blocks[index].end.toString()
            });
        } else {
            setFormData({
                start: hour.toString(),
                end: (hour + 1).toString(),
                label: '',
                title: '',
                color: '#f3f3f3'
            });
        }
        setSelectedDay(day);
        setSelectedHour(hour);
        setModalOpen(true);
    };

    const isOverlapping = (newStart, newEnd, day, indexToIgnore = null) => {
        return blocks.some((block, i) => {
            if (block.day !== day || i === indexToIgnore) return false;
            const existingStart = parseInt(block.start);
            const existingEnd = parseInt(block.end);
            return (
                (newStart < existingEnd && newEnd > existingStart)
            );
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const start = parseInt(formData.start);
        const end = parseInt(formData.end);

        if (end <= start) {
            setErrorMessage("End time must be after start time.");
            return;
        }

        if (isOverlapping(start, end, selectedDay, editingIndex)) {
            setErrorMessage("Time block overlaps with an existing block.");
            return;
        }

        const newBlock = { ...formData, day: selectedDay };
        if (editingIndex !== null) {
            setBlocks(prev => prev.map((b, i) => i === editingIndex ? newBlock : b));
        } else {
            setBlocks(prev => [...prev, newBlock]);
        }

        setErrorMessage('');
        setModalOpen(false);
    };


    const getGridPosition = (day, startHour, endHour) => {
        const col = days.indexOf(day) + 2;
        const rowStart = hours.indexOf(parseInt(startHour)) + 2;
        const rowEnd = hours.indexOf(parseInt(endHour)) + 2;
        return { gridColumn: col, gridRow: `${rowStart} / ${rowEnd}` };
    };

    return (
        <div className="schedule-container">
            <div className="schedule-grid">
                <div className="corner-cell" style={{ gridRow: 1, gridColumn: 1 }} />

                {days.map((day, index) => (
                    <div
                        key={day}
                        className="day-header"
                        style={{ gridRow: 1, gridColumn: index + 2 }}
                    >
                        {day}
                    </div>
                ))}

                {hours.map((hour, hourIndex) => (
                    <div
                        key={`hour-${hour}`}
                        className="hour-label"
                        style={{ gridRow: hourIndex + 2, gridColumn: 1 }}
                    >
                        {hour}:00
                    </div>
                ))}

                {hours.map((hour, hourIndex) => (
                    days.map(day => (
                        <div
                            key={`${day}-${hour}`}
                            className="schedule-cell"
                            style={{
                                gridRow: hourIndex + 2,
                                gridColumn: days.indexOf(day) + 2
                            }}
                            onClick={() => openModal(day, hour)}
                        />
                    ))
                ))}

                {blocks.map((block, i) => {
                    const pos = getGridPosition(block.day, block.start, block.end);
                    return (
                        <div
                            key={i}
                            className="block"
                            style={{
                                ...pos,
                                backgroundColor: block.color || '#f3f3f3'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                openModal(block.day, parseInt(block.start), i);
                            }}
                        >
                            <div className="block-content">
                                <strong>{block.title}</strong>
                                <div>{block.label}</div>
                                <div className="time-text">{block.start}:00 - {block.end}:00</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {modalOpen && (
                <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingIndex !== null ? 'Edit' : 'Add New'} Schedule Block</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Enter title"
                                    required
                                />
                            </div>
                            <label>Color</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={e => setFormData({...formData, color: e.target.value})}
                            />
                            <div className="form-group">
                                <label>Time</label>
                                <div className="time-inputs">
                                    <select
                                        value={formData.start}
                                        onChange={e => setFormData({...formData, start: e.target.value})}
                                        required
                                    >
                                        {hours.map(h => (
                                            <option key={`start-${h}`} value={h}>{h}:00</option>
                                        ))}
                                    </select>
                                    <span> to </span>
                                    <select
                                        value={formData.end}
                                        onChange={e => setFormData({...formData, end: e.target.value})}
                                        required
                                    >
                                        {hours.map(h => (
                                            h > parseInt(formData.start) && <option key={`end-${h}`} value={h}>{h}:00</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={e => setFormData({...formData, label: e.target.value})}
                                    placeholder="Enter description"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary">
                                    {editingIndex !== null ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                        {editingIndex !== null && (
                            <button
                                type="button"
                                className="delete-day"
                                onClick={() => {
                                    setBlocks(prev => prev.filter((_, i) => i !== editingIndex));
                                    setModalOpen(false);
                                }}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchedulePage;