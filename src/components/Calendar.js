import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, getDaysInMonth } from 'date-fns';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Day from './Day';
import EventForm from './EventForm';
import '../styles/Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(JSON.parse(localStorage.getItem('events')) || []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('welcomeShown'));

  useEffect(() => {
    try {
      localStorage.setItem('events', JSON.stringify(events));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [events]);

  useEffect(() => {
    if (showWelcome) {
      localStorage.setItem('welcomeShown', 'true');
    }
  }, [showWelcome]);

  const getDays = () => {
    if (view === 'day') {
      return [currentDate];
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  const days = getDays();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDayClick = (date) => {
    setSelectedEvent({ date });
    setShowForm(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowForm(true);
  };

  const handleDrop = (eventId, newDate) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const hasConflict = events.some(e =>
      e.id !== eventId &&
      isSameDay(new Date(e.date), newDate) &&
      e.time === event.time
    );

    if (hasConflict) {
      alert('Cannot move event: Time conflict on this date.');
      return;
    }

    setEvents(events.map(e =>
      e.id === eventId ? { ...e, date: newDate } : e
    ));
  };

  const handleDelete = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

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
  const pickerDays = Array.from(
    { length: getDaysInMonth(currentDate) },
    (_, i) => i + 1
  );

  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate());

  const handleDateSelect = (e) => {
    e.stopPropagation();
    console.log('Navigation date picker confirmed:', { selectedYear, selectedMonth, selectedDay });
    const newDate = new Date(selectedYear, selectedMonth - 1, view === 'day' ? selectedDay : 1);
    setCurrentDate(newDate);
    setShowDatePicker(false);
  };

  const handlePickerClick = (e) => {
    e.stopPropagation();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar" role="region" aria-label="Event Calendar">
        {showWelcome && (
          <div className="welcome-message" role="dialog" aria-labelledby="welcome-title">
            <h3 id="welcome-title">Welcome to Your Calendar!</h3>
            <p>Click any date to add a new event. Use the navigation above to select a month or day, and filter events by search or category.</p>
            <button
              onClick={() => setShowWelcome(false)}
              aria-label="Dismiss welcome message"
            >
              Got it!
            </button>
          </div>
        )}
        <div className="calendar-controls">
          <div className="calendar-navigation">
            <div className="nav-date-picker">
              <input
                type="text"
                value={format(currentDate, view === 'month' ? 'MMMM yyyy' : view === 'week' ? 'MMM d, yyyy' : 'MMMM d, yyyy')}
                readOnly
                onClick={() => {
                  console.log('Toggling navigation date picker:', !showDatePicker);
                  setShowDatePicker(!showDatePicker);
                }}
                aria-label="Select calendar date"
              />
              {showDatePicker && (
                <div className="nav-date-picker-box" onClick={handlePickerClick}>
                  <div className="picker-column">
                    <h4>Year</h4>
                    <div className="picker-list" role="listbox" aria-label="Select year">
                      {years.map(year => (
                        <div
                          key={year}
                          className={`picker-item ${year === selectedYear ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('Selected year:', year);
                            setSelectedYear(year);
                          }}
                          role="option"
                          aria-selected={year === selectedYear}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="picker-column">
                    <h4>Month</h4>
                    <div className="picker-list" role="listbox" aria-label="Select month">
                      {months.map(month => (
                        <div
                          key={month.value}
                          className={`picker-item ${month.value === selectedMonth ? 'selected' : ''}`}
                          onClick={() => {
                            console.log('Selected month:', month.value);
                            setSelectedMonth(month.value);
                            if (view === 'day') {
                              const maxDays = getDaysInMonth(new Date(selectedYear, month.value - 1));
                              if (selectedDay > maxDays) {
                                console.log('Adjusting day to:', maxDays);
                                setSelectedDay(maxDays);
                              }
                            }
                          }}
                          role="option"
                          aria-selected={month.value === selectedMonth}
                        >
                          {month.name}
                        </div>
                      ))}
                    </div>
                  </div>
                  {view === 'day' && (
                    <div className="picker-column">
                      <h4>Day</h4>
                      <div className="picker-list" role="listbox" aria-label="Select day">
                        {pickerDays.map(day => (
                          <div
                            key={day}
                            className={`picker-item ${day === selectedDay ? 'selected' : ''}`}
                            onClick={() => {
                              console.log('Selected day:', day);
                              setSelectedDay(day);
                            }}
                            role="option"
                            aria-selected={day === selectedDay}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleDateSelect}
                    aria-label="Confirm date selection"
                  >
                    Confirm
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="calendar-view-toggle">
            <button
              onClick={() => setView('month')}
              className={view === 'month' ? 'active' : ''}
              aria-pressed={view === 'month'}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={view === 'week' ? 'active' : ''}
              aria-pressed={view === 'week'}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={view === 'day' ? 'active' : ''}
              aria-pressed={view === 'day'}
            >
              Day
            </button>
          </div>
          <div className="calendar-filters">
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search events by title or description"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter events by category"
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>
          </div>
        </div>
        <div className={`calendar-grid ${view}`}>
          {view !== 'day' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          {days.map(day => (
            <Day
              key={day}
              date={day}
              events={filteredEvents.filter(event => isSameDay(new Date(event.date), day))}
              onDayClick={handleDayClick}
              onDrop={handleDrop}
              isCurrentDay={isSameDay(day, new Date())}
              view={view}
              showAddIndicator={view === 'month'}
              onEventClick={handleEventClick}
            />
          ))}
        </div>
        {showForm && (
          <EventForm
            event={selectedEvent}
            events={events}
            onSave={(newEvents) => {
              // Check if updating or adding
              const updatedIds = newEvents.map(e => e.id);
              const filtered = events.filter(e => !updatedIds.includes(e.id));
              setEvents([...filtered, ...newEvents]);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
            onDelete={handleDelete}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default Calendar;