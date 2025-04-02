import React from 'react';
import { MdDateRange, MdLocationOn } from 'react-icons/md'; // Use exact icons

const EventCard = ({ event }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section with Border */}
      <div className="relative h-56 bg-gray-100 overflow-hidden border-b">
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
        {/* Event Name */}
        <h2 className="text-lg font-semibold text-gray-900 mb-1 truncate">{event.eventName}</h2>

        {/* Date Section with Exact Icon & Color */}
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MdDateRange className="text-gray-500 mr-2 text-lg" />
          <span className="font-medium">
            {new Date(event.eventDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}{' '}
            • {event.eventTime}
          </span>
        </div>

        {/* Location Section with Exact Icon & Color */}
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MdLocationOn className="text-gray-500 mr-2 text-lg" />
          <span className="truncate">{event.venue}</span>
        </div>

        {/* Price in Correct Style */}
        <div className="text-blue-600 font-bold text-lg mb-4">
          {event.price ? `${event.price} LKR` : 'Free'} <span className="text-gray-500 text-sm">upwards</span>
        </div>

        {/* Buy Tickets Button */}
        <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">
          Buy Tickets
        </button>
      </div>
    </div>
  );
};

export default EventCard;
