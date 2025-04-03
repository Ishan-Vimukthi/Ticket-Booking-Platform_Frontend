import React, { createContext, useContext, useState } from 'react';

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
        item => item.id === product.id && item.size === product.selectedSize
      );
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id && item.size === product.selectedSize
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      
      return [...prevItems, { 
        ...product,
        size: product.selectedSize,
        quantity: product.quantity || 1
      }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
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