// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './contexts/CartContext'

// Handle database separation - clear old authentication data
const handleDatabaseSeparation = () => {
  // Check if this is first time after database separation
  const dbSeparationHandled = localStorage.getItem('db_separation_handled');
  
  if (!dbSeparationHandled) {
    console.log('🔄 Detected database separation - clearing old authentication data...');
    
    // Clear all old authentication data
    const keysToRemove = ['ecom_token', 'ecom_user', 'token', 'user', 'admin_token', 'admin_user'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Mark as handled
    localStorage.setItem('db_separation_handled', 'true');
    localStorage.setItem('db_separation_date', new Date().toISOString());
    
    console.log('✅ Database separation handling complete');
    console.log('🔑 Please login with new credentials: admin@gmail.com / admin123');
  }
};

// Initialize database separation handling
handleDatabaseSeparation();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
)