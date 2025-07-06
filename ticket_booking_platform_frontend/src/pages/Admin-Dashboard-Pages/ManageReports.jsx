import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/dashboard_Components/Sidebar';
import D_Navbar from '../../components/dashboard_Components/D_Navbar';
import axios from 'axios';

const ManageReports = () => {
  const [allEvents, setAllEvents] = useState([]); // Store all fetched events
  const [displayedEvents, setDisplayedEvents] = useState([]); // Events to display (can be filtered later if needed)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all events on component mount
  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:3000/api/events');
      setAllEvents(response.data.data || []);
      setDisplayedEvents(response.data.data || []);
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchReport = async (eventId) => {
    setLoading(true);
    setError('');
    setReport(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/events/${eventId}/report`);
      setReport(response.data.data);
      // Find the selected event details from allEvents to ensure we have the full object
      setSelectedEvent(allEvents.find(e => e._id === eventId)); 
    } catch (err) {
      setError('Failed to fetch report. Please try again later.');
      console.error(err);
    }
    setLoading(false);
  };
  
  const handleClearReport = () => {
    setSelectedEvent(null);
    setReport(null);
    setError(''); 
    // Optionally, re-display the list of all events if it was hidden
    setDisplayedEvents(allEvents); 
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <D_Navbar />
        <div className="p-6 bg-gray-100 min-h-screen">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Reports</h1>

          {/* Search input removed */}

          {loading && <p className="text-blue-600">Loading...</p>}
          {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}

          {!selectedEvent && !loading && displayedEvents.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Select an Event to View Report:</h2>
              <ul className="space-y-2 max-h-96 overflow-y-auto"> {/* Added max height and scroll */}
                {displayedEvents.map((event) => (
                  <li
                    key={event._id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-200 flex justify-between items-center"
                    onClick={() => fetchReport(event._id)}
                  >
                    <span>{event.eventName}</span>
                    <span className="text-sm text-gray-500">{new Date(event.eventDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {!selectedEvent && !loading && displayedEvents.length === 0 && !error && (
             <div className="bg-white shadow-md rounded-lg p-4 mt-6">
                <p className="text-gray-600">No events found.</p>
             </div>
          )}

          {report && selectedEvent && (
            <div className="bg-white shadow-xl rounded-lg p-6 mt-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
                <div>
                  <h2 className="text-2xl font-bold text-blue-700">{selectedEvent.eventName}</h2>
                  <p className="text-gray-600">{new Date(selectedEvent.eventDate).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={handleClearReport}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150"
                >
                    Clear Report & View All Events
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-blue-800">Total Revenue</h3>
                  <p className="text-2xl font-bold text-blue-600">${report.totalRevenue?.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-green-800">Total Tickets Sold</h3>
                  <p className="text-2xl font-bold text-green-600">{report.totalTicketsSold}</p>
                </div>
              
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Ticket Sales by Category</h3>
                {Object.keys(report.ticketSalesByCategory).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(report.ticketSalesByCategory).map(([category, data]) => (
                          <tr key={category} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{data.count}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${data.revenue?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-600">No category-specific sales data available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageReports;
