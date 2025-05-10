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
    const [currentBlockId, setCurrentBlockId] = useState(null);

    useEffect(() => {
        const fetchScheduleBlocks = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;

                const response = await fetch('http://localhost:8080/api/schedule-blocks', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch schedule blocks');
                }

                const data = await response.json();
                setBlocks(data);
            } catch (error) {
                console.error('Error fetching schedule blocks:', error);
            }
        };

        fetchScheduleBlocks();
    }, []);


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

    const handleSubmit = async (e) => {
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

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const scheduleBlockDto = {
                day: selectedDay,
                startHour: start,
                endHour: end,
                title: formData.title,
                label: formData.label,
                color: formData.color
            };

            let response;
            if (editingIndex !== null) {
                response = await fetch(`http://localhost:8080/api/schedule-blocks/${currentBlockId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(scheduleBlockDto),
                });
            } else {
                response = await fetch('http://localhost:8080/api/schedule-blocks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(scheduleBlockDto),
                });
            }

            if (!response.ok) {
                throw new Error(editingIndex !== null ? 'Failed to update block' : 'Failed to create block');
            }

            const updatedBlock = await response.json();

            if (editingIndex !== null) {
                setBlocks(prev => prev.map(block =>
                    block.id === currentBlockId ? updatedBlock : block
                ));
            } else {
                setBlocks(prev => [...prev, updatedBlock]);
            }

            setErrorMessage('');
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving schedule block:', error);
            setErrorMessage(error.message || 'An error occurred while saving');
        }
    };

    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`http://localhost:8080/api/schedule-blocks/${currentBlockId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete block');
            }

            setBlocks(prev => prev.filter(block => block.id !== currentBlockId));
            setModalOpen(false);
        } catch (error) {
            console.error('Error deleting schedule block:', error);
            setErrorMessage(error.message || 'An error occurred while deleting');
        }
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
                                onClick={handleDelete}
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