import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import MiddleTextEvents from '../components/MiddleTextEvents';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${API_BASE}/api/events`, {
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        setEvents(data);
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
      <Navbar />
      <MiddleTextEvents />

      

      {/* Event Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.length > 0 ? (
            events.map(event => <EventCard key={event._id} event={event} />)
          ) : (
            <p className="text-center text-gray-600 col-span-full">No events available at the moment.</p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Events;
