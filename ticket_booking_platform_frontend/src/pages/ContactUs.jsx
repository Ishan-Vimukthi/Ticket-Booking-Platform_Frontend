import React from 'react';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';

const ContactUs = () => {
  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4">Our Office</h2>
              <p className="text-gray-700 mb-4">
                <strong>Address:</strong> 123 Event Street, Sydney, NSW 2000, Australia
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Phone:</strong> (02) 1234 5678
              </p>
              <p className="text-gray-700 mb-4">
                <strong>Email:</strong> support@bigidea.com.au
              </p>
              <h2 className="text-2xl font-bold mb-4">Business Hours</h2>
              <p className="text-gray-700">
                Monday - Friday: 9am - 5pm
              </p>
              <p className="text-gray-700">
                Saturday - Sunday: Closed
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactUs;
