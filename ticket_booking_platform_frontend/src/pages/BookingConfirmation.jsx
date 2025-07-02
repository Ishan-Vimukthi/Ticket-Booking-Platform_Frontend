import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Using Heroicons for a nice checkmark

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingDetails } = location.state || {};

  useEffect(() => {
    if (!bookingDetails) {
      console.warn('Booking confirmation accessed without booking details. Redirecting to home.');
      navigate('/');
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    // This will be briefly shown before navigate takes effect, or if navigation fails for some reason
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-600 text-lg">Loading confirmation or invalid access...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { 
    bookingId, 
    event, // Should contain eventName, eventDate
    bookedSeats, 
    ticketHolder, // Should contain name, email
    totalPaid,
    paymentIntentId // If passed from confirmCardPayment flow
  } = bookingDetails;
  
  const paymentIdToDisplay = paymentIntentId || bookingDetails.paymentId;


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 py-12 pt-24 max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your tickets are booked and a confirmation email will be sent shortly .
          </p>

          <div className="text-left space-y-4 bg-gray-50 p-6 rounded-md border">
            <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Booking Summary</h2>
            <div>
              <strong className="text-gray-600">Booking ID:</strong>
              <span className="ml-2 text-gray-800">{bookingId}</span>
            </div>
            {event && (
              <div>
                <strong className="text-gray-600">Event:</strong>
                <span className="ml-2 text-gray-800">{event.eventName}</span>
              </div>
            )}
            {event && event.eventDate && (
               <div>
                <strong className="text-gray-600">Date & Time:</strong>
                <span className="ml-2 text-gray-800">
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'short', day: 'numeric',
                  })}
                  {event.eventTime ? ` at ${event.eventTime}` : ''}
                </span>
              </div>
            )}
            {bookedSeats && bookedSeats.length > 0 && (
              <div>
                <strong className="text-gray-600">Seats:</strong>
                <span className="ml-2 text-gray-800">{bookedSeats.join(', ')}</span>
              </div>
            )}
            {ticketHolder && (
              <>
                <div>
                  <strong className="text-gray-600">Booked For:</strong>
                  <span className="ml-2 text-gray-800">{ticketHolder.name}</span>
                </div>
                <div>
                  <strong className="text-gray-600">Email:</strong>
                  <span className="ml-2 text-gray-800">{ticketHolder.email}</span>
                </div>
              </>
            )}
            <div>
              <strong className="text-gray-600">Total Paid:</strong>
              <span className="ml-2 text-gray-800 font-semibold">USD {Number(totalPaid).toLocaleString()}</span>
            </div>
            {paymentIdToDisplay && (
              <div>
                <strong className="text-gray-600">Payment ID:</strong>
                <span className="ml-2 text-gray-800">{paymentIdToDisplay}</span>
              </div>
            )}
          </div>

          <div className="mt-10">
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200 mr-4"
            >
              Back to Home
            </Link>
            <Link
              to="/events"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-md transition duration-200"
            >
              Browse More Events
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
