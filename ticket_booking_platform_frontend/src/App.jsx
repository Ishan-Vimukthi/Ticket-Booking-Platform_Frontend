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
import OrderConfirmation from "./pages/Ecom_Pages/OrderConfirmation"; // Order confirmation page
import EventDetail from "./components/EventDetail";
import EventCheckout from "./pages/EventCheckout"; // New Event Checkout Page
import BookingConfirmation from "./pages/BookingConfirmation"; // New Booking Confirmation Page
import AdminLogin from "./pages/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute";

// Ecom Admin Components
import { EcomAdminProvider } from "./contexts/EcomAdminContext";
import EcomAdminProtectedRoute from "./components/ecom_admin/EcomAdminProtectedRoute";
import EcomAdminLayout from "./components/ecom_admin/EcomAdminLayout";
import LoginScreen from "./components/ecom_admin/Auth/LoginScreen";
import Dashboard from "./components/ecom_admin/Dashboard/Dashboard";
import ProductList from "./components/ecom_admin/Products/ProductList";
import CustomerList from "./components/ecom_admin/Customers/CustomerList";
import OrderList from "./components/ecom_admin/Orders/OrderList";
import StockList from "./components/ecom_admin/Stocks/StockList";
import RecycleBinList from "./components/ecom_admin/RecycleBin/RecycleBinList";

const App = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <EcomAdminProvider>
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
            <Route path="/order-confirmation/:orderId?" element={<OrderConfirmation />} /> {/* Order confirmation */}
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

            {/* E-commerce Admin Routes */}
            <Route path="/ecom_admin/login" element={<LoginScreen />} />
            <Route
              path="/ecom_admin/dashboard"
              element={
                <EcomAdminProtectedRoute>
                  <EcomAdminLayout>
                    <Dashboard />
                  </EcomAdminLayout>
                </EcomAdminProtectedRoute>
              }
            />
            <Route
              path="/ecom_admin/products"
              element={
                <EcomAdminProtectedRoute>
                  <EcomAdminLayout>
                    <ProductList />
                  </EcomAdminLayout>
                </EcomAdminProtectedRoute>
              }
            />
            <Route
              path="/ecom_admin/customers"
              element={
                <EcomAdminProtectedRoute>
                  <EcomAdminLayout>
                    <CustomerList />
                  </EcomAdminLayout>
                </EcomAdminProtectedRoute>
              }
            />
            <Route
              path="/ecom_admin/orders"
              element={
                <EcomAdminProtectedRoute>
                  <EcomAdminLayout>
                    <OrderList />
                  </EcomAdminLayout>
                </EcomAdminProtectedRoute>
              }
            />
            <Route
              path="/ecom_admin/stocks"
              element={
                <EcomAdminProtectedRoute>
                  <EcomAdminLayout>
                    <StockList />
                  </EcomAdminLayout>
                </EcomAdminProtectedRoute>
              }
            />
            <Route
              path="/ecom_admin/recycle-bin"
              element={
                <EcomAdminProtectedRoute>
                  <EcomAdminLayout>
                    <RecycleBinList />
                  </EcomAdminLayout>
                </EcomAdminProtectedRoute>
              }
            />

            {/* Redirect any unmatched routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastContainer />
          <CartSlider />
        </EcomAdminProvider>
      </CartProvider>
    </BrowserRouter>
  );
};


export default App;

