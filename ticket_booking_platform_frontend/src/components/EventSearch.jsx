import React, { useState } from "react";
import { Search } from "lucide-react";

const EventSearch = ({ setSearchQuery }) => {
  const [query, setQuery] = useState(""); // Single state for input

  const handleSearch = () => {
    setSearchQuery(query); // Pass the query for searching
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-blue-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Let’s Book Your Ticket
          </h1>
          <p className="text-lg text-white mt-2">
            Discover your favorite entertainment right here
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
          <span className="pl-4 text-gray-400">
            <Search size={24} />
          </span>
          <input
            type="text"
            placeholder="Search by event name or venue"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown} // Handle Enter key
            className="w-full py-3 px-4 focus:outline-none text-gray-800"
          />
          <button
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 font-semibold transition"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventSearch;
