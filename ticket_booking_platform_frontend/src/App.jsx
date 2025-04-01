import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Event from "./pages/Event";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Shop from "./pages/Shop";
import ProductPage from "./pages/Ecom_Pages/ProductPage";
import AdminDashboard from "./pages/Admin-Dashboard-Pages/AdminDashboard";
import ManageEvents from "./pages/Admin-Dashboard-Pages/ManageEvents";
import ManageReports from "./pages/Admin-Dashboard-Pages/ManageReports";
import SeatMapping from "./pages/Admin-Dashboard-Pages/SeatMapping";
import EditProfile from "./pages/Admin-Dashboard-Pages/EditProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartSlider from "./components/ecom_Components/cart/CartSlider";
import { CartProvider } from "./contexts/CartContext";

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Event />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/manage-event" element={<ManageEvents />} />
          <Route path="/reporting" element={<ManageReports />} />
          <Route path="/seat-map" element={<SeatMapping />} />
          <Route path="/edit-profile" element={<EditProfile />} />

          {/* Redirect any unmatched routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
        <CartSlider />
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
