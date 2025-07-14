import React from 'react'
import Sidebar from '../../components/dashboard_Components/Sidebar'
import D_Navbar from '../../components/dashboard_Components/D_Navbar'
import VenueManager from '../../components/dashboard_Components/VenueManager'

const ManageReports = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <D_Navbar />
        <div className="p-5">
          <h1 className="text-2xl font-semibold mb-4">Seat Mapping</h1>
          <div>
            <VenueManager />
          </div>
        </div>
    </div>
    </div>
  )
}

export default ManageReports
