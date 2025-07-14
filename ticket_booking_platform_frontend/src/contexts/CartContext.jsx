import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.id === product.id && item.size === (product.size || product.selectedSize)
      );
      
      if (existingItem) {
        // Don't exceed stock limit when adding more
        const requestedQuantity = existingItem.quantity + (product.cartQuantity || 1);
        const newQuantity = Math.min(requestedQuantity, existingItem.stockQuantity);
        
        // Show warning if we hit the stock limit
        if (requestedQuantity > existingItem.stockQuantity) {
          toast.warning(`Only ${existingItem.stockQuantity} items available. Added maximum possible.`, {
            position: "top-center",
            autoClose: 3000
          });
        }
        
        return prevItems.map(item =>
          item.id === product.id && item.size === (product.size || product.selectedSize)
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      return [...prevItems, { 
        ...product,
        size: product.size || product.selectedSize,
        quantity: product.cartQuantity || 1,  // Cart quantity (starts at 1)
        stockQuantity: product.quantity,      // Original stock quantity for validation
        image: product.image
      }];
    });
  };

  const removeFromCart = (id, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === id && item.size === size))
    );
  };

  const updateQuantity = (id, size, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id, size);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id && item.size === size) {
          // Limit quantity to available stock
          const limitedQuantity = Math.min(newQuantity, item.stockQuantity || newQuantity);
          
          // Show warning if user tried to exceed stock limit
          if (newQuantity > item.stockQuantity && item.stockQuantity) {
            toast.warning(`Only ${item.stockQuantity} items available in stock`, {
              position: "top-center",
              autoClose: 2000
            });
          }
          
          return { ...item, quantity: limitedQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        openCart,
        closeCart,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        setCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export { CartContext };