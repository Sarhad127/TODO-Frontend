import React from 'react';
import './SchedulePage.css';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 9 }, (_, i) => (8 + i).toString());

function SchedulePage() {
    return (
        <div className="schedule-container">
            <div className="schedule-grid">
                <div className="corner-cell" />
                {days.map(day => (
                    <div key={day} className="day-header">{day}</div>
                ))}
                {hours.map(hour => (
                    <React.Fragment key={hour}>
                        <div className="hour-label">{hour}</div>
                        {days.map(day => (
                            <div key={`${day}-${hour}`} className="schedule-cell" />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

export default SchedulePage;
