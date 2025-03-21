import React from "react";
import Navbar from "../components/NavBar";
import Footer from "../components/Footer";
import MiddleTextEvents from "../components/MiddleTextEvents";
import EventCard from "../components/EventCard";

const Event = () => {
  return (
    <div>
      <Navbar />
      <MiddleTextEvents />

      {/* Event Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
          <EventCard />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Event;
