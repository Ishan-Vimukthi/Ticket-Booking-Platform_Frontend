import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import MiddleTextEvents from "../components/MiddleTextEvents";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const Event = () => {
  

  return (
    <div>
      <NavBar />
      <MiddleTextEvents />
      
      <Footer />
    </div>
  );
};

export default Event;