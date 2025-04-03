import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MiddleTextEvents from "../components/MiddleTextEvents";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${API_BASE}/api/events`);
        
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched events:", data); // Debugging

        // Get today's date at midnight to avoid timezone issues
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Handle the new response structure with data.data
        const eventsData = data.data || [];
        
        const upcomingEvents = eventsData.filter((event) => {
          const eventDate = new Date(event.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= currentDate;
        });

        console.log("Upcoming Events:", upcomingEvents);
        setEvents(upcomingEvents);
        setFilteredEvents(upcomingEvents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p className="text-center text-gray-600">Loading events...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  return (
    <div>
      <NavBar />
      <MiddleTextEvents />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => <EventCard key={event._id} event={event} />)
          ) : (
            <p className="text-center text-gray-600 col-span-full">
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