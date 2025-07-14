import React, { useState, useEffect } from 'react';
import EditEventForm from '../dashboard_Components/editEventForm';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]); // New state for venues
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+RXZlbnQgSW1hZ2U8L3RleHQ+PC9zdmc+';

  // New function to fetch venues
  const fetchVenues = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/venues`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data.venues && Array.isArray(data.venues)) {
        return data.venues;
      }
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Fetch venues error:', error);
      throw new Error(error.message || 'Failed to fetch venues.');
    }
  };

  const fetchEvents = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/events`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      } else if (data.events && Array.isArray(data.events)) {
        return data.events;
      }
      throw new Error('Unexpected API response format');
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error(error.message || 'Failed to fetch events. Please check your connection and try again.');
    }
  };

  const deleteEvent = async (id) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete event: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const loadData = async () => {
      try {
        const [eventsData, venuesData] = await Promise.all([
          fetchEvents(),
          fetchVenues()
        ]);
        
        if (mounted) {
          setEvents(eventsData || []);
          setVenues(venuesData || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          if (err.message.includes('Failed to fetch') || err.message.includes('connection refused')) {
            setError('Could not connect to server. Please make sure the backend is running.');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadData();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [retryCount]);

  // Helper function to get venue name by ID
  const getVenueName = (venueId) => {
    const venue = venues.find(v => v._id === venueId);
    return venue ? venue.name : 'Location not specified';
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(eventToDelete);
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventToDelete));
      setDeleteModalOpen(false);
      window.location.reload();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete event. Please try again.');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleEditClick = (event) => {
    setEventToEdit({
      ...event,
      venueName: getVenueName(event.venue) // Add venueName to the event object
    });
    setEditModalOpen(true);
  };

  const handleEventUpdate = (updatedEvent) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => 
        event._id === updatedEvent._id ? updatedEvent : event
      );
    });
    setEditModalOpen(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800">Error Loading Events</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <div className="mt-4 space-x-3">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
          {error.includes('backend is running') && (
            <a 
              href="http://localhost:3000/api/events" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Test API Endpoint
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {!Array.isArray(events) || events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Events Found</h3>
          <p className="mt-1 text-gray-500">There are currently no events to display.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id || Math.random()} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                {event.image ? (
                  <img
                    src={event.image.startsWith('http') ? event.image : 
                      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${event.image}`
                    }
                    alt={event.eventName || 'Event image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = fallbackImage;
                      e.target.className = 'w-full h-full object-contain p-4';
                    }}
                  />
                ) : (
                  <img
                    src={event.image || fallbackImage}
                    alt={event.eventName}
                    className="w-full h-full object-contain p-4"
                  />
                )}
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {event.status || 'Upcoming'}
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {event.eventName || 'Untitled Event'}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                  {event.eventDescription || 'No description provided'}
                </p>

                <div className="flex items-center text-gray-500 mb-3">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : 'Date not set'}{' '}
                    {event.eventTime && `at ${event.eventTime}`}
                  </span>
                </div>

                <div className="flex items-center text-gray-500 mb-4">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{getVenueName(event.venue)}</span>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <button
                    onClick={() => handleEditClick(event)}
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setEventToDelete(event._id);
                      setDeleteModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800 font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-lg font-medium mb-4">Confirm Deletion</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this event? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Event</h2>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <EditEventForm 
                event={eventToEdit} 
                venues={venues} // Pass venues to the edit form
                onClose={() => setEditModalOpen(false)}
                onUpdate={handleEventUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;