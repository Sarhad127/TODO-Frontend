import React, {useEffect, useState} from 'react';
import './SchedulePage.css';
import printIcon from "../../icons/printer.png";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const COLOR_OPTIONS = [
    '#f3f3f3',
    '#7a77be',
    '#c75dea',
    '#dc6b6b',
    '#97cc83',
    '#e3d974',
    '#48cc91',
    '#a8a8a8',
    '#d24949'
];

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
        color: COLOR_OPTIONS[0]
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentBlockId, setCurrentBlockId] = useState(null);
    const normalizeDayName = (backendDay) => {
        return backendDay.charAt(0) + backendDay.slice(1).toLowerCase();
    };
    const [isEditing, setIsEditing] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [startHour, setStartHour] = useState(8);
    const [endHour, setEndHour] = useState(16);

    const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) return;
                const [blocksResponse, settingsResponse] = await Promise.all([
                    fetch('http://localhost:8080/api/schedule-blocks', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    }),
                    fetch('http://localhost:8080/api/schedule-blocks/schedule-settings', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    })
                ]);

                if (!blocksResponse.ok) {
                    throw new Error('Failed to fetch schedule blocks');
                }
                if (!settingsResponse.ok) {
                    throw new Error('Failed to fetch schedule settings');
                }

                const blocksData = await blocksResponse.json();
                const settingsData = await settingsResponse.json();

                setBlocks(blocksData);
                setStartHour(settingsData.startHour);
                setEndHour(settingsData.endHour);

            } catch (error) {
                console.error('No schedule settings found');
            }
        };

        fetchData();
    }, []);


    const openModal = (day, hour, block = null) => {
        setIsEditing(block !== null);

        if (block) {
            setFormData({
                start: block.startHour.toString(),
                end: block.endHour.toString(),
                label: block.label,
                title: block.title,
                color: block.color || '#f3f3f3'
            });
            setCurrentBlockId(block.id);
        } else {
            setFormData({
                start: hour.toString(),
                end: (hour + 1).toString(),
                label: '',
                title: '',
                color: '#f3f3f3'
            });
            setCurrentBlockId(null);
        }

        setSelectedDay(day);
        setSelectedHour(hour);
        setModalOpen(true);
    };

    const isOverlapping = (newStart, newEnd, day, blockIdToIgnore = null) => {
        return blocks.some((block) => {
            const blockDay = normalizeDayName(block.day);
            if (blockDay !== day || block.id === blockIdToIgnore) return false;
            const existingStart = block.startHour;
            const existingEnd = block.endHour;
            return (newStart < existingEnd && newEnd > existingStart);
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

        if (isOverlapping(start, end, selectedDay, currentBlockId)) {
            setErrorMessage("Time block overlaps with an existing block.");
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) throw new Error('No authentication token found');

            const scheduleBlockDto = {
                day: selectedDay.toUpperCase(),
                startHour: start,
                endHour: end,
                title: formData.title,
                label: formData.label,
                color: formData.color
            };

            const url = isEditing
                ? `http://localhost:8080/api/schedule-blocks/${currentBlockId}`
                : 'http://localhost:8080/api/schedule-blocks';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(scheduleBlockDto),
            });

            if (!response.ok) throw new Error(isEditing ? 'Failed to update block' : 'Failed to create block');

            const updatedBlock = await response.json();

            setBlocks(prev => isEditing
                ? prev.map(block => block.id === currentBlockId ? updatedBlock : block)
                : [...prev, updatedBlock]
            );

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

    const handleSaveSettings = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        if (startHour >= endHour) {
            alert('End hour must be after start hour');
            return;
        }
        const blocksOutsideRange = blocks.some(block => {
            return block.startHour < startHour || block.endHour > endHour;
        });

        if (blocksOutsideRange) {
            alert('Cannot change schedule hours as some existing blocks would fall outside the new time range');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/schedule-blocks/schedule-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ startHour, endHour })
            });

            if (response.ok) {
                setSettingsModalOpen(false);
            } else {
                const errorData = await response.json();
                console.log('Failed to save settings');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    return (
        <div className="schedule-container">
            <div className="scroll-wrapper">
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

                {blocks.map((block) => {
                    const dayName = normalizeDayName(block.day);
                    const pos = getGridPosition(dayName, block.startHour, block.endHour);

                    return (
                        <div
                            key={block.id}
                            className="block"
                            style={{
                                ...pos,
                                backgroundColor: block.color || '#f3f3f3'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setCurrentBlockId(block.id);
                                openModal(dayName, block.startHour, block);
                            }}
                        >
                            <div className="block-content">
                                <strong>{block.title}</strong>
                                {block.label && <div>{block.label}</div>}
                                <div className="time-text">
                                    {block.startHour}:00 - {block.endHour}:00
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div className="button-container">
                    <button className="print-button" onClick={() => window.print()}>
                        <img src={printIcon} alt="Print" />
                    </button>
                    <button
                        className="settings-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSettingsModalOpen(true);
                        }}
                    >
                        ⚙️
                    </button>
                </div>
            </div>
            </div>
            {modalOpen && (
                <div className="modal-backdrop" onClick={() => {
                    setModalOpen(false);
                    setErrorMessage('');
                }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingIndex !== null ? 'Edit' : 'Add New'} Schedule Block</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    spellCheck={false}
                                    type="text"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    placeholder="Enter title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <div className="color-options">
                                    {COLOR_OPTIONS.map((color, index) => (
                                        <div
                                            key={index}
                                            className={`color-option ${formData.color === color ? 'selected' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData({...formData, color})}
                                        />
                                    ))}
                                </div>
                            </div>
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
                                    spellCheck={false}
                                    type="text"
                                    value={formData.label}
                                    onChange={e => setFormData({...formData, label: e.target.value})}
                                    placeholder="Enter description"
                                />
                            </div>
                            <div className="modal-actions-schedule-settings">
                                <button type="submit" className="save-btn-schedule">
                                    {editingIndex !== null ? 'Update' : 'Save'}
                                </button>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="delete-btn-schedule"
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </button>
                                )}
                                <button type="button" className="cancel-btn-schedule"
                                        onClick={() => setModalOpen(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {settingsModalOpen && (
                <div className="modal-backdrop" onClick={() => setSettingsModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>Schedule Settings</h2>
                        <div className="time-range-settings">
                            <div className="form-group">
                                <label>Start Hour:</label>
                                <input
                                    type="number"
                                    min="0"
                                    max={endHour - 1}
                                    value={startHour}
                                    onChange={e => setStartHour(parseInt(e.target.value))}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Hour:</label>
                                <input
                                    type="number"
                                    min={startHour + 1}
                                    max="23"
                                    value={endHour}
                                    onChange={e => setEndHour(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                        <div className="modal-actions-schedule-settings">
                            <button
                                type="button"
                                className="save-btn-schedule"
                                onClick={handleSaveSettings}
                            >
                                Save Settings
                            </button>
                            <button
                                type="button"
                                className="cancel-btn-schedule"
                                onClick={() => setSettingsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SchedulePage;