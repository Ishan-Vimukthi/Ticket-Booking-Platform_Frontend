import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with your actual Stripe Publishable Key in your .env file or directly here
const VITE_STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51RflZsH8Y4NurIedtVJjjow0vcGgcSjiakk7ukq6V7ylUwk3aKIUiySY3h9COv0IBi3ISnoQSw1kF0pllVuxzTUg00YRySt0o2"; 
const stripePromise = loadStripe(VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ eventDetails, selectedSeats, totalPrice, detailedSelectedSeats }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe.js has not loaded yet. Please try again in a moment.");
      setProcessing(false);
      return;
    }

    if (!name || !email || !phone) {
      setError('Please fill in all ticket holder details.');
      setProcessing(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card details are not available. Please ensure the form is loaded correctly.');
      setProcessing(false);
      return;
    }

    try {
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: name,
          email: email,
          phone: phone,
        },
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Failed to create payment method.');
        setProcessing(false);
        return;
      }

      // Send paymentMethod.id and other booking details to your backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${API_BASE_URL}/api/events/create-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: eventDetails._id,
          selectedSeats: detailedSelectedSeats.map(seat => ({
            seatId: seat.id,
            ticketType: seat.category
          })),
          ticketHolderDetails: { name, email, phone },
          paymentMethodId: paymentMethod.id,
          totalPrice: totalPrice,
        }),
      });

      const bookingResult = await response.json();

      if (!response.ok) {
        throw new Error(bookingResult.message || `Server error: ${response.status}`);
      }
      
      if (bookingResult.requiresAction && bookingResult.clientSecret) {
        // Handle 3D Secure or other SCA requirements
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(bookingResult.clientSecret);
        if (confirmError) {
          setError(confirmError.message || 'Failed to confirm payment.');
          setProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          setSucceeded(true);
          setError(null);
          setProcessing(false);
          // Navigate to a success page, passing booking details
          navigate('/booking-confirmation', { 
            state: { bookingDetails: { ...bookingResult, paymentIntentId: paymentIntent.id } } 
          });
        } else {
          setError('Payment confirmation failed. Status: ' + paymentIntent?.status);
          setProcessing(false);
        }
      } else if (bookingResult.bookingId) {
        // Payment succeeded directly
        setSucceeded(true);
        setError(null);
        setProcessing(false);
        navigate('/booking-confirmation', { 
          state: { bookingDetails: bookingResult }
        });
      } else {
         // Should not happen if backend is structured correctly
        setError(bookingResult.message || 'An unexpected error occurred during booking.');
        setProcessing(false);
      }

    } catch (err) {
      console.error("Checkout error:", err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold text-green-600">Payment Successful!</h2>
        <p className="text-gray-700">Your tickets have been booked.</p>
        {/* Ideally, show booking confirmation details here or navigate to a confirmation page */}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      {/* Stripe Card Element will go here */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Payment Details
        </label>
        <CardElement 
          className="p-3 border border-gray-300 rounded-md"
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={processing || !stripe || !elements || succeeded}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition duration-200 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay USD ${totalPrice.toLocaleString()}`}
      </button>
    </form>
  );
};

const EventCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventDetails, selectedSeats, totalPrice } = location.state || {};

  useEffect(() => {
    if (!eventDetails || !selectedSeats || !totalPrice) {
      // If state is missing, redirect back or to an error page
      console.warn('Checkout page accessed without necessary state. Redirecting...');
      navigate(-1); // Go back to the previous page
    }
  }, [eventDetails, selectedSeats, totalPrice, navigate]);

  if (!eventDetails || !selectedSeats || totalPrice === undefined) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading checkout details or invalid access...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Calculate seat details for display
  const getSeatDetailsForDisplay = (seatId) => {
    const seatMap = eventDetails.seatMapData?.seatMap; // Assuming seatMapData is passed in eventDetails
    if (!seatMap || !seatMap.categories) return { name: seatId, price: 'N/A', category: 'Unknown' };

    const getCategoryForSeat = (sId, categories) => {
        const rowLetter = sId.charAt(0);
        const rowIndex = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0);
        const reversedCategoriesView = [...categories].reverse();
        let cumulativeRowCount = 0;
        for (const reversedCat of reversedCategoriesView) {
            if (rowIndex >= cumulativeRowCount && rowIndex < cumulativeRowCount + reversedCat.rowCount) {
                return categories.find(originalCat => originalCat.name === reversedCat.name);
            }
            cumulativeRowCount += reversedCat.rowCount;
        }
        return categories.find(cat => cat.name === 'General') || null;
    };

    const category = getCategoryForSeat(seatId, seatMap.categories);
    const ticketType = eventDetails.ticketTypes?.find(tt => tt.type === category?.name);
    
    return {
      id: seatId,
      name: seatId, // Or format as "Row X Seat Y" if applicable
      price: ticketType?.price || category?.price || 0,
      category: category?.name || 'N/A',
    };
  };

  const detailedSelectedSeats = selectedSeats.map(getSeatDetailsForDisplay);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-12 pt-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Complete Your Booking</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md order-last md:order-first">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Order Summary</h2>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">{eventDetails.eventName}</h3>
              <p className="text-sm text-gray-500">
                {new Date(eventDetails.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'short', day: 'numeric',
                })} at {eventDetails.eventTime}
              </p>
              {/* <p className="text-sm text-gray-500">{eventDetails.venueName || 'Venue TBD'}</p> */}
            </div>

            <div className="space-y-3 mb-6 border-t border-b py-4">
              <h4 className="font-medium text-gray-700">Selected Seats:</h4>
              {detailedSelectedSeats.map(seat => (
                <div key={seat.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Seat {seat.name} ({seat.category})</span>
                  <span className="font-medium text-gray-800">USD {seat.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>USD {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Right Column - User Details and Payment */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6 text-gray-700">Ticket Holder & Payment</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                eventDetails={eventDetails}
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
                detailedSelectedSeats={detailedSelectedSeats}
              />
            </Elements>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventCheckout;
