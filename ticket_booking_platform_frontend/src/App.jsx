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
import AdminLogin from "./pages/Admin-Dashboard-Pages/AdminLogin";
import ProtectedRoute from "./components/dashboard_Components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartSlider from "./components/ecom_Components/cart/CartSlider";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Event />} />
          
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />

            {/* Admin Routes */}
            <Route path="/admin">
              <Route path="login" element={<AdminLogin />} />
              <Route
                index
                element={
                  <ProtectedRoute>
                    <AdminDashboard/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard/>
                  </ProtectedRoute>
                }
              />
              <Route
                path="manage-event"
                element={
                  <ProtectedRoute>
                    <AdminDashboard>
                      <ManageEvents />
                    </AdminDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="reporting"
                element={
                  <ProtectedRoute>
                    <AdminDashboard>
                      <ManageReports />
                    </AdminDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="seat-map"
                element={
                  <ProtectedRoute>
                    <AdminDashboard>
                      <SeatMapping />
                    </AdminDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path="edit-profile"
                element={
                  <ProtectedRoute>
                    <AdminDashboard>
                      <EditProfile />
                    </AdminDashboard>
                  </ProtectedRoute>
                }
              />
            </Route>
            
            {/* Redirect any unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
          <CartSlider />
        </AuthProvider>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;