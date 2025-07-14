import React from 'react';
import { MdDateRange, MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, venues = [] }) => {
  const navigate = useNavigate();

  // Get the lowest ticket price
  const getLowestPrice = () => {
    if (!event.ticketTypes?.length) return 'Free';
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
    return `USD ${minPrice}`;
  };

  // Get venue name safely
  const getVenueName = (venueId) => {
    if (!venues?.length) return venueId; // Fallback if no venues
    const venue = venues.find(v => v._id === venueId);
    return venue?.name || venueId; // Return name or fallback to ID
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        <img
          src={event.image || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={event.eventName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
          }}
        />
      </div>

      {/* Event Details */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{event.eventName}</h2>
        
        {/* Updated description with single line and text wrapping */}
        <p className="text-gray-600 text-sm mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
          {event.eventDescription}
        </p>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MdDateRange className="text-gray-500 mr-2 text-lg" />
          <span className="font-medium">
            {new Date(event.eventDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
            • {event.eventTime}
          </span>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MdLocationOn className="text-gray-500 mr-2 text-lg" />
          <span className="truncate">{getVenueName(event.venue)}</span>
        </div>

        <div className="mb-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            event.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
            event.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
            'bg-green-100 text-green-800'
          }`}>
            {event.status}
          </span>
        </div>

        <div className="text-blue-600 font-bold text-lg mb-4">
          {getLowestPrice()} <span className="text-gray-500 text-sm">upwards</span>
        </div>

        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          onClick={() => navigate(`/events/${event._id}`)}
        >
          Buy Tickets
        </button>
      </div>
    </div>
  );
};

export default EventCard;