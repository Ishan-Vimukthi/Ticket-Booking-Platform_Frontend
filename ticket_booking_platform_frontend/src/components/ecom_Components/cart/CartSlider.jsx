import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../contexts/CartContext';

const CartSlider = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity,
    cartTotal,
    isCartOpen,
    closeCart 
  } = useCart();

  return (
    <>
      {/* Blurred Background Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-md transition-opacity ${isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={closeCart}>
        </div>

      {/* Cart Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md z-50 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold">Your Cart ({cartItems.length})</h2>
            <button onClick={closeCart} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="ml-4 font-bold">LKR {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center mt-2">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 border rounded-l"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-t border-b">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 border rounded-r"
                          >
                            +
                          </button>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="ml-4 text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Total:</span>
              <span className="font-bold">LKR {cartTotal.toLocaleString()}</span>
            </div>
            <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSlider;
