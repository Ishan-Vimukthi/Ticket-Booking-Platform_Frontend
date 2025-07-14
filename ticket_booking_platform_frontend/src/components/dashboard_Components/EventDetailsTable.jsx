import React, { useState, useEffect } from "react";
import axios from "axios";

const EventDetailsTable = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/events") // Assuming your backend API is configured to be accessible via /api
      .then(response => {
        const fetchedEvents = response.data.data || [];
        // Format data as needed for the table
        const formattedEvents = fetchedEvents.map(event => ({
          _id: event._id, // Carry over the _id for the key prop
          name: event.eventName,
          ticketsSold: event.eventTicketsSold !== undefined ? event.eventTicketsSold : "N/A",
          date: new Date(event.eventDate).toLocaleDateString(),
          place: event.venue && event.venue.name ? event.venue.name : (event.venue || "N/A"), // Display Venue Name or ID or N/A
          revenue: event.eventRevenue !== undefined ? `$${Number(event.eventRevenue).toFixed(2)}` : "N/A",
        }));
        setEvents(formattedEvents);
      })
      .catch(error => {
        console.error("Error fetching event details:", error);
        setEvents([]); // Set to empty array on error
      });
  }, []);

  return (
    <div className="overflow-x-auto p-5">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Event Details</h2>
      <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
        {/* Table Header */}
        <thead className="bg-gray-100">
          <tr className="text-left text-gray-700 font-semibold">
            <th className="py-3 px-4 border-b">Event Name</th>
            <th className="py-3 px-4 border-b">Tickets Sold</th>
            <th className="py-3 px-4 border-b">Date</th>
            <th className="py-3 px-4 border-b">Venue</th>
            <th className="py-3 px-4 border-b">Revenue</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {events.length > 0 ? (
            events.map((event) => (
              <tr
                key={event._id} // Use event._id as the key
                className="border-b hover:bg-gray-50 transition duration-200"
              >
                <td className="py-3 px-4">{event.name}</td>
                <td className="py-3 px-4">{event.ticketsSold}</td>
                <td className="py-3 px-4">{event.date}</td>
                <td className="py-3 px-4">{event.place}</td>
                <td className="py-3 px-4">{event.revenue}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="py-3 px-4 text-center text-gray-500">
                No event data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventDetailsTable;
