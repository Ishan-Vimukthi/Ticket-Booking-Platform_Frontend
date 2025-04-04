import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import EventSearch from "../components/EventSearch";
import MiddleText from "../components/MiddleText";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        
        const [eventsResponse, venuesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/events`),
          fetch(`${API_BASE}/api/venues`)
        ]);

        if (!eventsResponse.ok || !venuesResponse.ok) {
          throw new Error(`Server Error: ${eventsResponse.status} or ${venuesResponse.status}`);
        }

        const eventsData = await eventsResponse.json();
        const venuesData = await venuesResponse.json();

        const eventsArray = eventsData.data || eventsData;
        const venuesArray = venuesData.data || venuesData;

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const filteredData = eventsArray.filter((event) => {
          const eventDate = new Date(event.eventDate);
          return (
            eventDate.getFullYear() === currentYear && 
            eventDate.getMonth() === currentMonth &&
            event.status !== "Cancelled"
          );
        });

        setEvents(filteredData);
        setFilteredEvents(filteredData);
        setVenues(venuesArray);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredEvents(events);
    } else {
      const lowerSearch = searchQuery.toLowerCase();
      const searchResults = events.filter(
        (event) =>
          event.eventName.toLowerCase().includes(lowerSearch) ||
          (event.venue && event.venue.toLowerCase().includes(lowerSearch)) ||
          (event.eventDescription && 
           event.eventDescription.toLowerCase().includes(lowerSearch))
      );
      setFilteredEvents(searchResults);
    }
  }, [searchQuery, events]);

  // Loading animation component
  const LoadingAnimation = () => (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex space-x-2">
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <p className="text-gray-600 text-lg">Loading events...</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <LoadingAnimation />
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <p className="text-center text-red-500 py-12">{error}</p>
      <Footer />
    </div>
  );

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
                  venues={venues}
                />
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full py-12">
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