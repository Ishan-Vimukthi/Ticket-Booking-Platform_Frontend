import React, { useState } from "react";
import Sidebar from "../../components/dashboard_Components/Sidebar";
import D_Navbar from "../../components/dashboard_Components/D_Navbar";
import AddEventButton from "../../components/dashboard_Components/AddEventButton";
import EventList from "../../components/dashboard_Components/EventList";

const ManageEvents = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <D_Navbar />
        <div className="p-5">
          <h1 className="text-2xl font-semibold mb-4">Manage Events</h1>
        </div>
        <div className="p-5">
          <AddEventButton />
          <div>
            <EventList/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
