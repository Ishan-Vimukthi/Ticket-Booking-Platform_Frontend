import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MiddleTextEvents from "../components/MiddleTextEvents";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        
        // Fetch both events and venues in parallel
        const [eventsResponse, venuesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/events`),
          fetch(`${API_BASE}/api/venues`)
        ]);

        if (!eventsResponse.ok || !venuesResponse.ok) {
          throw new Error(`Server Error: ${eventsResponse.status} or ${venuesResponse.status}`);
        }

        const eventsData = await eventsResponse.json();
        const venuesData = await venuesResponse.json();

        // Get today's date at midnight to avoid timezone issues
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Handle the response structure with data.data if exists
        const eventsArray = eventsData.data || eventsData;
        const venuesArray = venuesData.data || venuesData;

        const upcomingEvents = eventsArray.filter((event) => {
          const eventDate = new Date(event.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= currentDate;
        });

        setEvents(upcomingEvents);
        setFilteredEvents(upcomingEvents);
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

  if (loading) return (
    <div>
      <NavBar />
      <MiddleTextEvents />
      <LoadingAnimation />
      <Footer />
    </div>
  );

  if (error) return (
    <div>
      <NavBar />
      <MiddleTextEvents />
      <p className="text-center text-red-500 py-12">{error}</p>
      <Footer />
    </div>
  );

  return (
    <div>
      <NavBar />
      <MiddleTextEvents />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} venues={venues} />
            ))
          ) : (
            <p className="text-center text-gray-600 col-span-full py-12">
              No upcoming events available.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;