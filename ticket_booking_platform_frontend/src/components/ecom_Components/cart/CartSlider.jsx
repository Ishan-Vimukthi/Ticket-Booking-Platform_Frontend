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
        onClick={closeCart}
      ></div>

      {/* Cart Panel */}
      <div 
        className={`fixed inset-y-0 right-0 w-full max-w-md z-50 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-light uppercase tracking-wider">Cart</h2>
              <button onClick={closeCart} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <ul className="space-y-6">
                {cartItems.map((item) => (
                  <li key={item.id} className="pb-6 border-b border-gray-100">
                    <div className="flex">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-24 w-20 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          <p className="ml-4 font-bold">LKR {item.price.toLocaleString()}</p>
                        </div>
                        
                        {/* Display Color and Size */}
                        <div className="flex items-center mt-1 space-x-4">
                          <p className="text-sm text-gray-500">
                            Color: <span className="font-medium">{item.color || 'Black'}</span>
                          </p>
                          {item.size && (
                            <p className="text-sm text-gray-500">
                              Size: <span className="font-medium">{item.size}</span>
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-1">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm underline text-gray-500 hover:text-black"
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
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center py-4 border-b border-gray-200 mb-4">
              <span className="font-bold">Total</span>
              <span className="font-bold text-lg">LKR {cartTotal.toLocaleString()}</span>
            </div>
            
            <p className="text-xs text-gray-500 text-center mb-4">
              Shipping calculated at checkout
            </p>
            
            <button className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors font-medium">
              CHECKOUT • LKR {cartTotal.toLocaleString()}
            </button>
            
            <button className="w-full mt-2 text-center underline text-sm text-gray-500 hover:text-black">
              View cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSlider;