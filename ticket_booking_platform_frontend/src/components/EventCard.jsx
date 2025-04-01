import React from "react";
import { Calendar, MapPin } from "lucide-react";

const EventCard = () => {
  return (
    <div className="w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      {/* Event Image */}
      <img
        src="https://assets.mytickets.lk/images/events/Fairytales%20Suck/1080x%201080%20Fairytales%20Suck!-1741925806387.png"
        alt="Event name here"
        className="w-full h-[200px] object-cover"
      />

      {/* Event Details */}
      <div className="p-4">
        <h2 className="text-base font-bold text-gray-900">
          Fairytales Suck
        </h2>

        {/* Date & Time */}
        <div className="flex items-center text-gray-600 text-sm mt-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Mar 22, 2025 • 07:00 PM IST</span>
        </div>

        {/* Venue */}
        <div className="flex items-center text-gray-600 text-sm mt-2">
          <MapPin className="w-4 h-4 mr-2" />
          <span>Lionel Wendt</span>
        </div>

        {/* Price */}
        <p className="text-blue-600 font-bold text-sm mt-3">
          1,000 LKR upwards
        </p>

        {/* Buy Tickets Button */}
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Buy Tickets
        </button>
      </div>
    </div>
  );
};

export default EventCard;
