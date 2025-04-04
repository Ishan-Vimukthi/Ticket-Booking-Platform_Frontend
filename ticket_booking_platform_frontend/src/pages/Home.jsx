import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import EventSearch from "../components/EventSearch";
import MiddleText from "../components/MiddleText";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]); // Added venues state
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        
        // Fetch both events and venues in parallel like in Events.jsx
        const [eventsResponse, venuesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/events`),
          fetch(`${API_BASE}/api/venues`)
        ]);

        if (!eventsResponse.ok || !venuesResponse.ok) {
          throw new Error(`Server Error: ${eventsResponse.status} or ${venuesResponse.status}`);
        }

        const eventsData = await eventsResponse.json();
        const venuesData = await venuesResponse.json();

        // Handle the response structure with data.data if exists
        const eventsArray = eventsData.data || eventsData;
        const venuesArray = venuesData.data || venuesData;

        // Filter events for this month
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const filteredData = eventsArray.filter((event) => {
          const eventDate = new Date(event.eventDate);
          return (
            eventDate.getFullYear() === currentYear && 
            eventDate.getMonth() === currentMonth &&
            event.status !== "Cancelled" // Exclude cancelled events
          );
        });

        setEvents(filteredData);
        setFilteredEvents(filteredData);
        setVenues(venuesArray); // Set venues data
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          (event.venue && event.venue.toLowerCase().includes(lowerSearch)) || // Added null check
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
                <EventCard 
                  key={event._id} 
                  event={event} 
                  venues={venues} // Pass venues data to EventCard
                />
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