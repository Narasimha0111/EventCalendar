import React from 'react';
import { useDrag } from 'react-dnd';
import '../styles/Calendar.css';

const Event = ({ event, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'event',
    item: { id: event.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="event"
      style={{ backgroundColor: event.color, opacity: isDragging ? 0.5 : 1 }}
      onClick={() => onClick(event)}
      role="button"
      aria-label={`Edit event: ${event.title}`}
    >
      <span>{event.title}</span>
      <span>{event.time}</span>
    </div>
  );
};

const EventList = ({ events, onEventClick }) => {
  return (
    <div className="event-list">
      {events.map(event => (
        <Event key={event.id} event={event} onClick={onEventClick} />
      ))}
    </div>
  );
};

export default EventList;