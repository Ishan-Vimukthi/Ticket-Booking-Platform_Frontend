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
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="text-blue-400 hover:text-blue-500">
            <MdHome className="inline mr-2" />
            Home
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <Link to="/events" className="text-blue-400 hover:text-blue-500">
            Events
          </Link>
          <span className="mx-2 text-gray-500">/</span>
          <span className="text-gray-300">{event.eventName}</span>
        </div>
      </div>

      {/* Event Header */}
      <div className="bg-[#06122A] text-white py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center">
          <div className="flex-grow">
            <h1 className="text-3xl font-semibold mb-3">{event.eventName}</h1>
            <div className="flex items-center text-gray-300 mb-2">
              <MdDateRange className="mr-2" />
              <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })} • {event.eventTime} IST</span>
            </div>
            <div className="flex items-center text-gray-300">
              <MdLocationOn className="mr-2" />
              <span>{event.venue}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src={event.image || "https://via.placeholder.com/250x250?text=Event+Image"}
              alt={event.eventName}
              className="w-56 h-56 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Event Description */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">More info</h2>
              <p className="text-gray-700">{event.eventDescription || "No additional information available."}</p>
            </div>
          </div>

          {/* Right Column - Ticket Information */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Prices</h2>

              {/* Ticket Price Table */}
              <table className="w-full mb-4">
                <tbody>
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    event.ticketTypes.map((ticket, index) => (
                      <tr key={index} className="border-b border-gray-200 last:border-b-0">
                        <td className="py-3 text-gray-700">{ticket.type}</td>
                        <td className="py-3 text-right font-semibold text-blue-600">{ticket.price} USD</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="py-3 text-gray-500 text-center">
                        No ticket information available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

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

            {/* Ticket Policy Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3">Ticket Policy</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Only the initial email or SMS provided by MyTicketsLK will be accepted as proof of purchase.</li>
                <li>• Tickets will not be redeemed for any forwarded or screenshots.</li>
                <li>• Valid NIC or Passport will be required if needed during the process of redeeming.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;
