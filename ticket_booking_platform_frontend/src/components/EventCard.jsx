import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

// Local fallback image (place this in your public folder at public/fallback-event-image.png)

const EventCard = ({ event }) => {
  // Format date to "Month DD, YYYY" format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Find the minimum ticket price
  const getMinPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) return 'Free';
    const minPrice = Math.min(...event.ticketTypes.map(t => t.price));
    return `${minPrice} LKR upwards`;
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.error('Image failed to load:', e.target.src);
    e.target.src = FALLBACK_IMAGE;
    e.target.className = 'w-full h-full object-contain p-4 bg-gray-200';
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 m-4">
     
    </div>
  );
};



export default EventCard;