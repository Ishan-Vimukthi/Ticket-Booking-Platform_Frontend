import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Event from './pages/Event'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import Shop from './pages/Shop'
import AdminDashboard from './pages/Admin-Dashboard-Pages/AdminDashboard'
import ManageEvents from './pages/Admin-Dashboard-Pages/ManageEvents'
import ManageReports from './pages/Admin-Dashboard-Pages/ManageReports'
import SeatMapping from './pages/Admin-Dashboard-Pages/SeatMapping'
import EditProfile from './pages/Admin-Dashboard-Pages/EditProfile'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Event />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manage-event" element={<ManageEvents />} />
        <Route path='/reporting' element={<ManageReports />} />
        <Route path='/seat-map' element={<SeatMapping />} />
        <Route path='/edit-profile' element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
