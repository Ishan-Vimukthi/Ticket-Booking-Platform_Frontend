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
import ManageUsers from './pages/Admin-Dashboard-Pages/ManageUsers'
import SeatMapping from './pages/Admin-Dashboard-Pages/SeatMapping'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProductPage from './pages/Ecom_Pages/ProductPage'
import { CartProvider } from './contexts/CartContext';

const App = () => {
  return (
    <CartProvider>
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
          <Route path='/manage-users' element={<ManageUsers />} />
          <Route path="/product/:id" element={<ProductPage />} /> 
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;