import React from 'react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              Welcome to BigIdea, your premier destination for discovering and booking tickets for the most exciting events across Australia. Founded in 2023, our mission is to connect people with unforgettable live experiences, from concerts and festivals to theatre shows and sporting events.
            </p>
            <p className="text-gray-700 mb-4">
              Based in the heart of Sydney, our team is passionate about entertainment and technology. We believe that booking tickets should be a seamless and enjoyable experience, which is why we've created a user-friendly platform that makes it easy to find and purchase tickets to your favorite events.
            </p>
            <p className="text-gray-700 mb-4">
              At BigIdea, we're committed to providing our customers with a wide selection of events, competitive pricing, and exceptional customer service. We work closely with event organizers to ensure that you have access to the best seats and the most up-to-date information.
            </p>
            <p className="text-gray-700">
              Thank you for choosing BigIdea. We look forward to helping you create lasting memories at your next event!
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
