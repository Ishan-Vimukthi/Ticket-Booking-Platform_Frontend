import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";

const EventSearch = ({ searchQuery, setSearchQuery }) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  // Sync local state with parent component's searchQuery
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    // Trim whitespace before searching
    const trimmedQuery = localQuery.trim();
    setSearchQuery(trimmedQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    setSearchQuery("");
  };

  return (
    <div className="bg-blue-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Let's Book Your Ticket
          </h1>
          <p className="text-lg text-white mt-2">
            Discover your favorite entertainment right here
          </p>
        </div>

        {/* Search Bar - Styling remains exactly the same */}
        <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
          <span className="pl-4 text-gray-400">
            <Search size={24} />
          </span>
          <input
            type="text"
            placeholder="Search by event name or venue"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full py-3 px-4 focus:outline-none text-gray-800"
          />
          {/* Added clear button (hidden when no text) */}
          {localQuery && (
            <button
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700 px-2"
            >
              ✕
            </button>
          )}
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