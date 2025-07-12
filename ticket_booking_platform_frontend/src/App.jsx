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
import ManageAdmins from "./pages/Admin-Dashboard-Pages/ManageAdmins";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartSlider from "./components/ecom_Components/cart/CartSlider";
import { CartProvider } from "./contexts/CartContext";
import CheckoutPage from "./pages/Ecom_Pages/CheckoutPage"; // This is for the e-commerce shop
import EventDetail from "./components/EventDetail";
import EventCheckout from "./pages/EventCheckout"; // New Event Checkout Page
import BookingConfirmation from "./pages/BookingConfirmation"; // New Booking Confirmation Page
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Event />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/checkout" element={<CheckoutPage />} /> {/* E-commerce checkout */}
          <Route path="/checkout/event" element={<EventCheckout />} /> {/* Event ticket checkout */}
          <Route path="/booking-confirmation" element={<BookingConfirmation />} /> {/* Booking Confirmation page */}

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-event"
            element={
              <ProtectedRoute>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reporting"
            element={
              <ProtectedRoute>
                <ManageReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seat-map"
            element={
              <ProtectedRoute>
                <SeatMapping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-admins"
            element={
              <ProtectedRoute>
                <ManageAdmins />
              </ProtectedRoute>
            }
          />

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

