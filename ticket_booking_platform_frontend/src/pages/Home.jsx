import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import EventSearch from "../components/EventSearch";
import MiddleText from "../components/MiddleText";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${API_BASE}/api/events`);
        
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        const eventsData = data.data || []; // Access the data property from response

        // Filter events for this month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const filteredData = eventsData.filter((event) => {
          const eventDate = new Date(event.eventDate);
          return (
            eventDate.getFullYear() === currentYear && 
            eventDate.getMonth() === currentMonth &&
            event.status !== "Cancelled" // Exclude cancelled events
          );
        });

        setEvents(filteredData);
        setFilteredEvents(filteredData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
    } else {
      const lowerSearch = searchQuery.toLowerCase();
      const searchResults = events.filter(
        (event) =>
          event.eventName.toLowerCase().includes(lowerSearch) ||
          event.venue.toLowerCase().includes(lowerSearch) ||
          (event.eventDescription && 
           event.eventDescription.toLowerCase().includes(lowerSearch))
      );
      setFilteredEvents(searchResults);
    }
  }, [searchQuery, events]);

  if (loading) return <p className="text-center text-gray-600">Loading events...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <EventSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <MiddleText />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard  key={event._id} event={event} venues={venues} />
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">
                {searchQuery ? "No matching events found." : "No upcoming events this month."}
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;