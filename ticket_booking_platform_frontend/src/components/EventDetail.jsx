import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MdDateRange, MdLocationOn } from "react-icons/md";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { MdHome } from "react-icons/md";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        const response = await fetch(`${API_BASE}/api/events/${id}`);

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        setEvent(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div className="text-center p-10 text-gray-500">Loading event details...</div>;
  if (error) return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  if (!event) return <div className="text-center p-10 text-gray-500">Event not found</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#06122A]">
      <NavBar />

      {/* Breadcrumb */}
      <div className="bg-[#06122A] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/" className="text-blue-400 hover:text-blue-500 flex items-center">
            <MdHome className="inline mr-1" />
            Home
          </Link>
          <span className="mx-2 text-gray-500">›</span>
          <Link to="/events" className="text-blue-400 hover:text-blue-500">
            Events
          </Link>
          <span className="mx-2 text-gray-500">›</span>
          <span className="text-gray-300">{event.eventName}</span>
        </div>
      </div>

      {/* Event Header with Image */}
      <div className="bg-[#06122A] text-white py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            {/* Event Info */}
            <div className="flex-grow">
              <h1 className="text-4xl font-semibold mb-6">{event.eventName}</h1>
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="flex items-center text-gray-300">
                  <MdDateRange className="mr-2" size={20} />
                  <span>
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })} • {event.eventTime} IST
                  </span>
                </div>
                <div className="flex items-center text-gray-300">
                  <MdLocationOn className="mr-2" size={20} />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
            
            {/* Event Image */}
            <div className="md:w-1/3 mt-6 md:mt-0">
              <img
                src={event.image || "https://via.placeholder.com/400/320?text=Event+Image"}
                alt={event.eventName}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          {/* Left Column - Event Description and Info */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">More info</h2>
            <p className="text-gray-700 mb-6">{event.eventDescription || "No additional information available."}</p>

            {/* Ticket Policy */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-3">Ticket Policy</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Only the initial email provided by BigIdea will be accepted as proof of purchase. Tickets will not be redeemed for any forwarded or screenshots.</li>
                <li>• Valid NIC or Passport will be required if needed during the process of redeeming.</li>
                <li>• Tickets are non-refundable and non-transferable.</li>
                <li>• The event is subject to cancellation or rescheduling due to unforeseen circumstances.</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Ticket Information */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Prices</h2>

              {/* Ticket Price List */}
              <div className="mb-6">
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  event.ticketTypes.map((ticket, index) => (
                    <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                      <span className="text-gray-700">{ticket.type}</span>
                      <span className="font-semibold text-blue-600">USD {ticket.price}</span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-gray-500 text-center">
                    No ticket information available
                  </div>
                )}
              </div>

              {/* Buy Tickets Button */}
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-200"
                onClick={() => {
                  window.location.href = event.ticketLink || "#";
                }}
              >
                Buy Tickets
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail; 