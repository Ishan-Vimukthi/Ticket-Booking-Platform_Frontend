import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Home, X, ArrowLeft, ArrowRight, Minus, Plus, ChevronUp, ChevronDown, RotateCcw, AlertCircle, CreditCard, DollarSign } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [seatMapData, setSeatMapData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loadingSeatMap, setLoadingSeatMap] = useState(false);
  const [svgContainer, setSvgContainer] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const seatOriginalStylesRef = React.useRef({});
  const [processedSvgString, setProcessedSvgString] = useState(null);

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

        // Mock 3 ticket categories if not provided
        const mockTicketTypes = [
          { type: "Premium", price: 1500, description: "Best seats in the house" },
          { type: "Standard", price: 1000, description: "Great view and comfort" },
          { type: "Economy", price: 500, description: "Affordable seating option" }
        ];

        const processedEvent = {
          ...eventData.data || eventData,
          ticketTypes: (eventData.data?.ticketTypes || eventData.ticketTypes || []).length > 0 
            ? eventData.data?.ticketTypes || eventData.ticketTypes 
            : mockTicketTypes
        };

        setEvent(processedEvent);
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
      
      // Mock seat map data with 3 categories if not provided
      const mockSeatMapData = {
        ...data.data,
        seatMap: {
          categories: [
            { name: "Premium", price: 1500, color: "#22c55e", rowCount: 5 },
            { name: "Standard", price: 1000, color: "#3b82f6", rowCount: 8 },
            { name: "Economy", price: 500, color: "#a855f7", rowCount: 10 }
          ],
          ...data.data?.seatMap
        }
      };
      
      setSeatMapData(mockSeatMapData);
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

  const getCategoryForSeat = useCallback((seatId, seatMapCategories) => {
    if (!seatId || !seatMapCategories || seatMapCategories.length === 0) {
      return null; 
    }

    const rowLetter = seatId.charAt(0);
    const rowIndex = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0); 

    const reversedCategoriesView = [...seatMapCategories].reverse();
    
    let cumulativeRowCount = 0;
    for (const reversedCat of reversedCategoriesView) {
      if (rowIndex >= cumulativeRowCount && rowIndex < cumulativeRowCount + reversedCat.rowCount) {
        return seatMapCategories.find(originalCat => originalCat.name === reversedCat.name);
      }
      cumulativeRowCount += reversedCat.rowCount;
    }
    
    return seatMapCategories.find(cat => cat.name === 'Economy') || null;
  }, []);

  const getSeatPrice = useCallback((seatId) => {
    if (!seatMapData || !seatMapData.seatMap || !seatMapData.seatMap.categories) return 0;
    
    const category = getCategoryForSeat(seatId, seatMapData.seatMap.categories);
    return category?.price || 0;
  }, [seatMapData, getCategoryForSeat]);

  const calculateTotal = useCallback(() => {
    return selectedSeats.reduce((total, seatId) => {
      return total + getSeatPrice(seatId);
    }, 0);
  }, [selectedSeats, getSeatPrice]);

  const handleProceedToCheckout = () => {
    if (!event || selectedSeats.length === 0) {
      alert("Please select seats before proceeding.");
      return;
    }

    // Show payment confirmation modal instead of navigating directly
    setShowPaymentConfirmation(true);
  };

  const handlePaymentConfirmation = (confirmed) => {
    setShowPaymentConfirmation(false);
    
    if (confirmed) {
      const eventDetailsForCheckout = {
        _id: event._id,
        eventName: event.eventName,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        image: event.image,
        venueName: getVenueName(event.venue),
        ticketTypes: event.ticketTypes,
        seatMapData: seatMapData,
      };

      navigate('/checkout/event', { 
        state: { 
          eventDetails: eventDetailsForCheckout, 
          selectedSeats: selectedSeats, 
          totalPrice: calculateTotal() 
        } 
      });
    }
  };

  const getVenueName = (venueId) => {
    if (!venues || !Array.isArray(venues)) return venueId;
    const venue = venues.find(v => v._id === venueId);
    return venue ? venue.name : venueId;
  };

  useEffect(() => {
    if (seatMapData?.svgTemplate) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(seatMapData.svgTemplate, 'image/svg+xml');
      const svgElement = doc.querySelector('svg');
      
      if (svgElement) {
        const seatGroupElements = svgElement.querySelectorAll('g[data-seat]'); 
        
        seatOriginalStylesRef.current = {};

        seatGroupElements.forEach(group => {
          const seatId = group.getAttribute('data-seat');
          const rectElement = group.querySelector('rect');

          if (seatId && rectElement) {
            seatOriginalStylesRef.current[seatId] = {
              fill: rectElement.getAttribute('fill') || 'blue',
              stroke: rectElement.getAttribute('stroke') || 'black',
            };
            rectElement.style.cursor = 'pointer';
            
            // Check if seat is booked and apply booked styling
            if (rectElement.classList.contains('booked') || rectElement.classList.contains('sold')) {
              rectElement.style.fill = '#757575';
              rectElement.style.stroke = '#757575';
              rectElement.style.cursor = 'not-allowed';
            }
            
            if (rectElement.hasAttribute('onmouseover')) {
              rectElement.removeAttribute('onmouseover');
            }
            if (rectElement.hasAttribute('onmouseout')) {
              rectElement.removeAttribute('onmouseout');
            }
            if (group.hasAttribute('onmouseover')) {
              group.removeAttribute('onmouseover');
            }
            if (group.hasAttribute('onmouseout')) {
              group.removeAttribute('onmouseout');
            }

            group.classList.add('interactive-seat-group');
          }
        });
        setProcessedSvgString(new XMLSerializer().serializeToString(svgElement));
      } else {
        setProcessedSvgString(null);
      }
    }
  }, [seatMapData?.svgTemplate]);

  const handleSvgContainerRef = useCallback((node) => {
    if (node) {
      setSvgContainer(node);
    }
  }, []);

  useEffect(() => {
    if (!svgContainer || !processedSvgString) return;

    const handleClick = (e) => {
      const seatGroupElement = e.target.closest('g[data-seat]'); 
      
      if (seatGroupElement) {
        const seatId = seatGroupElement.getAttribute('data-seat');
        if (seatId && seatOriginalStylesRef.current[seatId]) { 
          if (seatGroupElement.querySelector('rect')) {
            const rectElement = seatGroupElement.querySelector('rect');
            if (rectElement && (rectElement.classList.contains('unavailable') || 
                               rectElement.classList.contains('booked') || 
                               rectElement.classList.contains('sold'))) {
              console.log(`Seat ${seatId} is unavailable.`);
              return; 
            }
            handleSeatSelection(seatId);
          }
        }
      }
    };

    svgContainer.addEventListener('click', handleClick);
    return () => {
      svgContainer.removeEventListener('click', handleClick);
    };
  }, [svgContainer, processedSvgString, handleSeatSelection]);

  useEffect(() => {
    if (!svgContainer || !Object.keys(seatOriginalStylesRef.current).length || !processedSvgString) return;

    Object.keys(seatOriginalStylesRef.current).forEach(seatId => {
      const groupElement = svgContainer.querySelector(`g[data-seat="${seatId}"]`);
      if (groupElement) {
        const rectElement = groupElement.querySelector('rect');
        if (rectElement && !rectElement.classList.contains('unavailable') && 
            !rectElement.classList.contains('booked') && !rectElement.classList.contains('sold')) {
          const originalStyle = seatOriginalStylesRef.current[seatId];
          if (selectedSeats.includes(seatId)) {
            rectElement.style.fill = '#10b981';
            rectElement.style.stroke = '#059669';
          } else {
            rectElement.style.fill = originalStyle.fill;
            rectElement.style.stroke = originalStyle.stroke;
          }
        }
      }
    });
  }, [selectedSeats, svgContainer, processedSvgString, seatOriginalStylesRef]);

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
            <Home className="inline mr-1" size={16} /> Home
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
                <Calendar className="mr-2" size={20} />
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
                <MapPin className="mr-2" size={20} />
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
                        <span className="font-semibold text-[#1a2332]">USD {ticket.price.toLocaleString()}</span>
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
                    <RotateCcw className="animate-spin mr-2" size={16} />
                    Loading Seat Map...
                  </span>
                ) : "Buy Tickets"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Seat Map Modal */}
      {showSeatMap && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header with event info */}
            <div className="bg-[#1a2332] text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => {
                    setShowSeatMap(false);
                    setSelectedSeats([]);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold">{event.eventName}</h2>
                  <div className="flex items-center text-gray-300 text-sm mt-1">
                    <Calendar className="mr-1" size={14} />
                    <span className="mr-4">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })} • {event.eventTime} IST
                    </span>
                    <MapPin className="mr-1" size={14} />
                    <span>{getVenueName(event.venue)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-300">BigIdea Group</div>
                </div>
                <button 
                  onClick={() => {
                    setShowSeatMap(false);
                    setSelectedSeats([]);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              {loadingSeatMap ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingAnimation text="Loading seat map..." />
                </div>
              ) : seatMapData ? (
                <div className="p-6">
                  {/* Seat Map Container */}
                  <div className="bg-gray-50 rounded-xl p-8 mb-6">
                   
                    
                    <div className="flex justify-center mb-8">
                      <div 
                        ref={handleSvgContainerRef}
                        className="seat-map-container"
                        style={{ maxWidth: '800px' }}
                        dangerouslySetInnerHTML={{ __html: processedSvgString || '' }}
                      />
                    </div>


                    
                  </div>

                  {/* Price Legend */}
                  <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <div className="flex flex-wrap justify-center gap-6">
                      {seatMapData.seatMap.categories
                        .map(category => {
                          const ticketType = event.ticketTypes?.find(t => t.type === category.name);
                          return {
                            ...category,
                            price: ticketType?.price || category.price || 0
                          };
                        })
                        .sort((a, b) => b.price - a.price)
                        .map((category, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-medium text-[#1a2332]">
                              {category.price.toLocaleString()} USD
                              {category.name ? ` (${category.name})` : ''}
                            </span>
                          </div>
                        ))}
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#757575' }} />
                        <span className="text-sm font-medium text-[#1a2332]">Sold</span>
                      </div>
                     
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-500">
                    <AlertCircle size={48} className="mx-auto mb-4" />
                    <p>Failed to load seat map</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Bar - Updated to show all selected seats */}
            <div className="bg-white border-t p-4">
              {selectedSeats.length === 0 ? (
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 flex items-center justify-center">
                  <AlertCircle className="mr-2 text-red-600" size={20} />
                  <span className="text-red-700 font-medium">No seats selected yet</span>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  {/* Selected seats display */}
                  <div className="flex items-start space-x-4">
                    <span className="text-gray-600 font-medium whitespace-nowrap mt-1">
                      {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected:
                    </span>
                    <div className="flex-1">
                      {/* Container with max height and scroll for many seats */}
                      <div className={`flex flex-wrap gap-2 ${selectedSeats.length > 20 ? 'max-h-24 overflow-y-auto' : ''}`}>
                        {selectedSeats.map((seatId, index) => (
                          <span 
                            key={index} 
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200 hover:bg-green-200 transition-colors cursor-pointer"
                            onClick={() => handleSeatSelection(seatId)}
                            title="Click to deselect"
                          >
                            {seatId}
                            <X size={12} className="inline ml-1 opacity-60" />
                          </span>
                        ))}
                      </div>
                      {selectedSeats.length > 20 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Scroll to see all selected seats
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Total and checkout */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {calculateTotal().toLocaleString()} USD
                      </div>
                      <div className="text-sm text-gray-500">
                        Total for {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={handleProceedToCheckout}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center space-x-3">
                
                <div>
                  <h3 className="text-xl font-bold">Payment Confirmation</h3>
                 
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                
                <p className="text-gray-700 text-lg leading-relaxed">
                  The payment will be processed in <strong className="text-blue-600">USD</strong> currency using 
                  <strong className="text-blue-600"> Stripe</strong> payment gateway.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Order Summary:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} - {calculateTotal().toLocaleString()} USD
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-600 mb-6">
                Do you want to continue with the checkout process?
              </p>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handlePaymentConfirmation(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  No, Cancel
                </button>
                <button
                  onClick={() => handlePaymentConfirmation(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Yes, Continue
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <CreditCard size={14} />
                <span>Secure payment powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetail;