import React, { useState } from 'react';
import { format, addDays, addMonths, isSameDay, getDaysInMonth } from 'date-fns';
import { v4 as uuid } from 'uuid';
import '../styles/Calendar.css';

const EventForm = ({ event, events, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [time, setTime] = useState(event?.time || '12:00');
  const [description, setDescription] = useState(event?.description || '');
  const [recurrence, setRecurrence] = useState(event?.recurrence || 'none');
  const [customInterval, setCustomInterval] = useState(event?.customInterval || 1);
  const [weeklyDays, setWeeklyDays] = useState(event?.weeklyDays || []);
  const [category, setCategory] = useState(event?.category || 'work');
  const [color, setColor] = useState(event?.color || '#007bff');
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const initialDate = event?.date ? new Date(event.date) : new Date();
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);
  const months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' },
  ];
  const days = Array.from(
    { length: getDaysInMonth(new Date(selectedYear, selectedMonth - 1)) },
    (_, i) => i + 1
  );

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleWeeklyDaysChange = (day) => {
    setWeeklyDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handlePickerClick = (e) => {
    e.stopPropagation();
  };

  const getSelectedDate = () => {
    return new Date(selectedYear, selectedMonth - 1, selectedDay);
  };

  const checkConflicts = (newEvent) => {
    return events.some(e =>
      e.id !== newEvent.id &&
      isSameDay(new Date(e.date), newEvent.date) &&
      e.time === newEvent.time
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const baseEvent = {
      id: event?.id || uuid(),
      title,
      date: getSelectedDate(),
      time,
      description,
      recurrence,
      customInterval,
      weeklyDays,
      category,
      color,
    };

    let newEvents = [baseEvent];

    if (recurrence === 'daily') {
      for (let i = 1; i <= 30; i++) {
        const newDate = addDays(getSelectedDate(), i * customInterval);
        newEvents.push({ ...baseEvent, id: uuid(), date: newDate });
      }
    } else if (recurrence === 'weekly') {
      for (let i = 1; i <= 4; i++) {
        weeklyDays.forEach(day => {
          const dayIndex = daysOfWeek.indexOf(day);
          const baseDate = new Date(getSelectedDate());
          const daysToAdd = (dayIndex - baseDate.getDay() + 7) % 7 + (i - 1) * 7 * customInterval;
          const newDate = addDays(baseDate, daysToAdd);
          newEvents.push({ ...baseEvent, id: uuid(), date: newDate });
        });
      }
    } else if (recurrence === 'monthly') {
      for (let i = 1; i <= 12; i++) {
        const newDate = addMonths(getSelectedDate(), i * customInterval);
        newEvents.push({ ...baseEvent, id: uuid(), date: newDate });
      }
    }

    const conflicts = newEvents.some(checkConflicts);
    if (conflicts) {
      setError('One or more events conflict with existing events.');
      return;
    }

    setError('');
    onSave(newEvents); // ✅ This ensures compatibility with updated Calendar.js
  };

  return (
    <div className="event-form" role="dialog" aria-labelledby="event-form-title">
      <h3 id="event-form-title">{event?.id ? 'Edit Event' : 'Add Event'}</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            aria-required="true"
          />
        </label>
        <label>
          Date:
          <div className="date-picker">
            <input
              type="text"
              value={format(getSelectedDate(), 'yyyy-MM-dd')}
              readOnly
              onClick={() => setShowDatePicker(!showDatePicker)}
              aria-label="Select event date"
            />
            {showDatePicker && (
              <div className="date-picker-box" onClick={handlePickerClick}>
                <div className="picker-column">
                  <h4>Year</h4>
                  <div className="picker-list">
                    {years.map(year => (
                      <div
                        key={year}
                        className={`picker-item ${year === selectedYear ? 'selected' : ''}`}
                        onClick={() => setSelectedYear(year)}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="picker-column">
                  <h4>Month</h4>
                  <div className="picker-list">
                    {months.map(month => (
                      <div
                        key={month.value}
                        className={`picker-item ${month.value === selectedMonth ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedMonth(month.value);
                          const maxDays = getDaysInMonth(new Date(selectedYear, month.value - 1));
                          if (selectedDay > maxDays) setSelectedDay(maxDays);
                        }}
                      >
                        {month.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="picker-column">
                  <h4>Day</h4>
                  <div className="picker-list">
                    {days.map(day => (
                      <div
                        key={day}
                        className={`picker-item ${day === selectedDay ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedDay(day);
                          setShowDatePicker(false);
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </label>
        <label>
          Time:
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            aria-label="Event time"
          />
        </label>
        <label>
          Description:
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            aria-label="Event description"
          />
        </label>
        <label>
          Recurrence:
          <select
            value={recurrence}
            onChange={e => setRecurrence(e.target.value)}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        {recurrence !== 'none' && (
          <label>
            Interval (every X periods):
            <input
              type="number"
              min="1"
              value={customInterval}
              onChange={e => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </label>
        )}
        {recurrence === 'weekly' && (
          <div className="weekly-days">
            <label>Days of the Week:</label>
            <div className="weekly-days-checkboxes">
              {daysOfWeek.map(day => (
                <label key={day} className="weekly-day-label">
                  <input
                    type="checkbox"
                    checked={weeklyDays.includes(day)}
                    onChange={() => handleWeeklyDaysChange(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>
        )}
        <label>
          Category:
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
          </select>
        </label>
        <label>
          Color:
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </label>
        <div className="form-buttons">
          <button type="submit">Save</button>
          {event?.id && (
            <button type="button" onClick={() => onDelete(event.id)}>
              Delete
            </button>
          )}
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm;
