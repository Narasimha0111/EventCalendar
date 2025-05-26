import React from 'react';
import { useDrop } from 'react-dnd';
import EventList from './EventList';
import { format } from 'date-fns';
import '../styles/Calendar.css';

const Day = ({ date, events, onDayClick, onDrop, isCurrentDay, view, showAddIndicator, onEventClick }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'event',
    drop: (item) => onDrop(item.id, date),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`calendar-day ${isCurrentDay ? 'current-day' : ''} ${isOver ? 'drag-over' : ''} ${view}`}
      onClick={() => onDayClick(date)}
      data-tooltip="Click to add event"
      role="button"
      aria-label={`Add event on ${format(date, 'MMMM d, yyyy')}`}
    >
      <div className="day-header">
        {format(date, view === 'month' ? 'd' : 'MMM d')}
        {showAddIndicator && (
          <span className="add-event-indicator" aria-hidden="true">+</span>
        )}
      </div>
      <EventList events={events} onEventClick={onEventClick} />
    </div>
  );
};

export default Day;