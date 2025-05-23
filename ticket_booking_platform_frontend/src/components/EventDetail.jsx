import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MdDateRange, MdLocationOn, MdHome, MdClose } from "react-icons/md";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [seatMapData, setSeatMapData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeatMap, setLoadingSeatMap] = useState(false);
  const [svgContainer, setSvgContainer] = useState(null);

  // Loading animation component
  const LoadingAnimation = ({ text = "Loading..." }) => (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex space-x-2">
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-4 h-4 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <p className="text-gray-600 text-lg">{text}</p>
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
        
        const [eventResponse, venuesResponse] = await Promise.all([
          fetch(`${API_BASE}/api/events/${id}`),
          fetch(`${API_BASE}/api/venues`)
        ]);

        if (!eventResponse.ok || !venuesResponse.ok) {
          throw new Error(`Server Error: ${eventResponse.status} or ${venuesResponse.status}`);
        }

        const eventData = await eventResponse.json();
        const venuesData = await venuesResponse.json();

        setEvent(eventData.data || eventData);
        setVenues(venuesData.data || venuesData);
      } catch (err) {
        setError(err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchSeatMap = async () => {
    if (!event || !event.venue) return;
    
    setLoadingSeatMap(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE}/api/venues/${event.venue}/event/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch seat map: ${response.status}`);
      }
      
      const data = await response.json();
      setSeatMapData(data.data);
      setShowSeatMap(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSeatMap(false);
    }
  };

  const handleSeatSelection = useCallback((seatId) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  }, []);

  const getSeatPrice = useCallback((seatId) => {
    if (!seatMapData || !event?.ticketTypes) return 0;
    
    const rowLetter = seatId.charAt(0);
    const rowNumber = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    
    // Find category based on row number
    let currentRowCount = 0;
    const category = seatMapData.seatMap.categories.find(cat => {
      currentRowCount += cat.rowCount;
      return rowNumber <= currentRowCount;
    });
    
    // Match category name with ticket type
    const ticketType = category ? event.ticketTypes.find(t => t.type === category.name) : null;
    return ticketType?.price || 0;
  }, [seatMapData, event?.ticketTypes]);

  const calculateTotal = useCallback(() => {
    return selectedSeats.reduce((total, seatId) => {
      return total + getSeatPrice(seatId);
    }, 0);
  }, [selectedSeats, getSeatPrice]);

  const handleProceedToCheckout = () => {
    console.log("Proceeding to checkout with seats:", selectedSeats);
    alert(`Proceeding to checkout with ${selectedSeats.length} seats. Total: USD ${calculateTotal().toLocaleString()}`);
  };

  const getVenueName = (venueId) => {
    if (!venues || !Array.isArray(venues)) return venueId;
    const venue = venues.find(v => v._id === venueId);
    return venue ? venue.name : venueId;
  };

  // Process SVG to add interactivity
  const processSvg = useCallback((svgString) => {
    if (!svgString) return svgString;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = doc.querySelector('svg');
    
    if (!svgElement) return svgString;
    
    const seatElements = svgElement.querySelectorAll('[class*="seat"], rect, circle, path');
    
    seatElements.forEach(seat => {
      let seatId = seat.getAttribute('id') || 
                 seat.getAttribute('data-seat') || 
                 `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`;
      
      seat.setAttribute('id', `seat_${seatId}`);
      seat.style.cursor = 'pointer';
      seat.style.transition = 'fill 0.2s, stroke 0.2s';
      
      const originalFill = seat.getAttribute('fill') || '#3b82f6';
      const originalStroke = seat.getAttribute('stroke') || '#1d4ed8';
      
      seat.setAttribute('data-original-fill', originalFill);
      seat.setAttribute('data-original-stroke', originalStroke);
      
      if (selectedSeats.includes(seatId)) {
        seat.setAttribute('fill', '#10b981');
        seat.setAttribute('stroke', '#059669');
      }
    });
    
    return new XMLSerializer().serializeToString(svgElement);
  }, [selectedSeats]);

  const handleSvgContainerRef = useCallback((node) => {
    if (node) {
      setSvgContainer(node);
    }
  }, []);

  useEffect(() => {
    if (!svgContainer || !seatMapData) return;

    const handleClick = (e) => {
      const seatElement = e.target.closest('[id^="seat_"]');
      if (seatElement) {
        const seatId = seatElement.id.replace('seat_', '');
        handleSeatSelection(seatId);
        
        if (selectedSeats.includes(seatId)) {
          seatElement.style.fill = seatElement.getAttribute('data-original-fill');
          seatElement.style.stroke = seatElement.getAttribute('data-original-stroke');
        } else {
          seatElement.style.fill = '#10b981';
          seatElement.style.stroke = '#059669';
        }
      }
    };

    svgContainer.addEventListener('click', handleClick);
    
    return () => {
      svgContainer.removeEventListener('click', handleClick);
    };
  }, [svgContainer, seatMapData, handleSeatSelection, selectedSeats]);

  const renderSelectedSeats = () => {
    if (!seatMapData || selectedSeats.length === 0) {
      return <p className="text-gray-500 text-center py-4">No seats selected yet</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {selectedSeats.map((seatId, index) => {
          const rowLetter = seatId.charAt(0);
          const seatNumber = seatId.substring(1);
          const price = getSeatPrice(seatId);
          
          // Find category for border color
          const rowNumber = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
          let currentRowCount = 0;
          const category = seatMapData.seatMap.categories.find(cat => {
            currentRowCount += cat.rowCount;
            return rowNumber <= currentRowCount;
          });
          
          return (
            <div 
              key={index} 
              className="border p-3 rounded-lg flex justify-between items-center"
              style={{ borderLeft: `4px solid ${category?.color || '#ccc'}` }}
            >
              <div className="flex items-center">
                <div className="font-bold mr-2">{rowLetter}{seatNumber}</div>
                <div className="text-sm text-gray-600">{category?.name || 'General'}</div>
              </div>
              <div className="font-bold text-blue-600">
                USD {price.toLocaleString()}
              </div>
              <button 
                onClick={() => handleSeatSelection(seatId)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-[#06122A] text-white">
      <NavBar />
      <LoadingAnimation text="Loading event details..." />
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col bg-[#06122A] text-white">
      <NavBar />
      <div className="text-center p-10 text-red-500">{error}</div>
      <Footer />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col bg-[#06122A] text-white">
      <NavBar />
      <div className="text-center p-10 text-gray-500">Event not found</div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#06122A] text-white">
      <NavBar />

      {/* Breadcrumb */}
      <div className="py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center">
          <Link to="/" className="text-blue-400 hover:text-blue-500 flex items-center">
            <MdHome className="inline mr-1" /> Home
          </Link>
          <span className="mx-2 text-gray-500">›</span>
          <Link to="/events" className="text-blue-400 hover:text-blue-500">Events</Link>
          <span className="mx-2 text-gray-500">›</span>
          <span className="text-gray-300">{event.eventName}</span>
        </div>
      </div>

      {/* Event Header */}
      <div className="relative bg-[#06122A] text-white px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end">
          <div className="md:flex-1 w-full md:pb-10"> 
            <h1 className="text-4xl font-bold mb-2">{event.eventName}</h1>
            <div className="flex flex-wrap gap-6 text-gray-300 text-lg">
              <div className="flex items-center">
                <MdDateRange className="mr-2" size={20} />
                <span>
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })} 
                  • {event.eventTime} IST
                </span>
              </div>
              <div className="flex items-center">
                <MdLocationOn className="mr-2" size={20} />
                <span>{getVenueName(event.venue)}</span>
              </div>
            </div>
          </div>

          <div className="md:w-1/3 mt-6 md:mt-0">
            <img 
              src={event.image || "https://via.placeholder.com/400x320"} 
              alt={event.eventName} 
              className="w-full rounded-lg shadow-lg" 
            />
          </div>
        </div>
      </div>

      {/* Event Details & Ticket Section */}
      <div className="bg-white text-black py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">More info</h2>
            <p className="text-gray-700 mb-6">{event.eventDescription || "No additional information available."}</p>

            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-3">Ticket Policy</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Only the initial email provided by BigIdea will be accepted as proof of purchase.</li>
                <li>• Tickets are non-refundable and non-transferable.</li>
                <li>• The event is subject to cancellation or rescheduling due to unforeseen circumstances.</li>
              </ul>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ticket Prices</h2>

              <div className="mb-6">
                {event.ticketTypes && event.ticketTypes.length > 0 ? (
                  event.ticketTypes.map((ticket, index) => (
                    <div key={index} className="py-3 border-b border-gray-200 last:border-b-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium">{ticket.type}</span>
                        <span className="font-semibold text-blue-600">USD {ticket.price.toLocaleString()}</span>
                      </div>
                      {ticket.description && (
                        <p className="text-xs text-gray-500 mt-1">{ticket.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-gray-500 text-center">No ticket information available</div>
                )}
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition duration-200"
                onClick={fetchSeatMap}
                disabled={loadingSeatMap}
              >
                {loadingSeatMap ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin mr-2">🌀</span>
                    Loading Seat Map...
                  </span>
                ) : "Buy Tickets"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Map Modal */}
      {showSeatMap && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-auto">
          {loadingSeatMap ? (
            <div className="bg-white rounded-lg p-8">
              <LoadingAnimation text="Loading seat map..." />
            </div>
          ) : seatMapData ? (
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold">Select Your Seats</h2>
                <button 
                  onClick={() => {
                    setShowSeatMap(false);
                    setSelectedSeats([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose size={24} />
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{event.eventName}</h3>
                  <p className="text-gray-600">
                    <MdLocationOn className="inline mr-1" />
                    {seatMapData.name}
                  </p>
                </div>
                
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {seatMapData.seatMap.categories
                    .map(category => {
                      const ticketType = event.ticketTypes?.find(t => t.type === category.name);
                      return {
                        ...category,
                        price: ticketType?.price || 0
                      };
                    })
                    .sort((a, b) => b.price - a.price)
                    .map((category, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-5 h-5 rounded-full mr-3" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-bold">{category.name}</span>
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          USD {category.price.toLocaleString()}
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-2">{category.description}</p>
                        )}
                      </div>
                    ))}
                </div>
                
                <div className="mb-8 text-center">
                  <div 
                    ref={handleSvgContainerRef}
                    className="seat-map-container mx-auto"
                    style={{ maxWidth: '800px' }}
                    dangerouslySetInnerHTML={{ __html: processSvg(seatMapData.svgTemplate) }}
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
                  <h4 className="font-semibold text-lg mb-4">Selected Seats ({selectedSeats.length})</h4>
                  {renderSelectedSeats()}
                </div>
                
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="text-xl">
                    <span className="font-semibold">Total:</span>
                    <span className="ml-3 text-2xl font-bold text-blue-600">
                      USD {calculateTotal().toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handleProceedToCheckout}
                    disabled={selectedSeats.length === 0}
                    className={`px-6 py-3 rounded-md font-semibold text-lg ${
                      selectedSeats.length === 0 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-red-500">Failed to load seat map</p>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;