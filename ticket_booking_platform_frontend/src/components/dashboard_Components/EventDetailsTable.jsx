import React from "react";

const EventDetailsTable = () => {
  // Sample event data (You can replace this with dynamic data)
  const events = [
    {
      name: "Music Festival 2024",
      ticketsSold: 500,
      date: "2024-06-15",
      place: "Los Angeles, CA",
      revenue: "$25,000",
    },
    {
      name: "Tech Conference",
      ticketsSold: 300,
      date: "2024-07-10",
      place: "San Francisco, CA",
      revenue: "$15,000",
    },
    {
      name: "Art Exhibition",
      ticketsSold: 200,
      date: "2024-08-05",
      place: "New York, NY",
      revenue: "$10,000",
    },
    {
      name: "Comedy Night",
      ticketsSold: 150,
      date: "2024-09-12",
      place: "Chicago, IL",
      revenue: "$7,500",
    },
  ];

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
            <th className="py-3 px-4 border-b">Place</th>
            <th className="py-3 px-4 border-b">Revenue</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {events.map((event, index) => (
            <tr
              key={index}
              className="border-b hover:bg-gray-50 transition duration-200"
            >
              <td className="py-3 px-4">{event.name}</td>
              <td className="py-3 px-4">{event.ticketsSold}</td>
              <td className="py-3 px-4">{event.date}</td>
              <td className="py-3 px-4">{event.place}</td>
              <td className="py-3 px-4">{event.revenue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventDetailsTable;
