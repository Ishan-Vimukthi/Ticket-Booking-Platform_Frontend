import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../contexts/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getProductImage } from '../../../utils/images';

const CartSlider = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity,
    cartTotal,
    isCartOpen,
    closeCart 
  } = useCart();

  const handleCheckoutClick = (e) => {
    if (cartItems.length === 0) {
      e.preventDefault();
      toast.error('Please add some products to your cart first', {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: '4rem' }
      });
    }
  };

  return (
    <>
      {/* Blurred Background Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md transition-opacity"
          onClick={closeCart}
        ></div>
      )}

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
                  <li key={`${item.id}-${item.size}`} className="pb-6 border-b border-gray-100">
                    <div className="flex">
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={getProductImage(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium">{item.name}</h3>
                          <p className="ml-4 font-bold">${item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            Size: <span className="font-medium">{item.size || 'Not specified'}</span>
                          </p>
                          {item.stockQuantity && (
                            <p className="text-xs text-gray-400">
                              {item.quantity >= item.stockQuantity ? 'Max quantity reached' : `${item.stockQuantity} available`}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center border rounded-md">
                            <button 
                              onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-1">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => {
                                if (item.stockQuantity && item.quantity >= item.stockQuantity) {
                                  toast.error(`Only ${item.stockQuantity} items available in stock`, {
                                    position: "top-center",
                                    autoClose: 2000,
                                    style: { marginTop: '4rem' }
                                  });
                                  return;
                                }
                                updateQuantity(item.id, item.size, item.quantity + 1);
                              }}
                              disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                              className={`px-3 py-1 transition-colors ${
                                item.stockQuantity && item.quantity >= item.stockQuantity
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'hover:bg-gray-100'
                              }`}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id, item.size)}
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
              <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
            </div>
            
            <p className="text-xs text-gray-500 text-center mb-4">
              Shipping calculated at checkout
            </p>
            
            <div className="flex justify-center">
              {cartItems.length > 0 ? (
                <Link 
                  to="/checkout" 
                  className="bg-black text-center text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors font-medium w-full max-w-xs"
                  onClick={closeCart}
                >
                  CHECKOUT • ${cartTotal.toFixed(2)}
                </Link>
              ) : (
                <button
                  onClick={handleCheckoutClick}
                  className="bg-gray-400 text-center text-white px-6 py-3 rounded-md font-medium w-full max-w-xs cursor-not-allowed"
                  disabled
                >
                  CHECKOUT • $0.00
                </button>
              )}
            </div>
            
            <Link 
              to="/cart" 
              className="block w-full mt-2 text-center underline text-sm text-gray-500 hover:text-black"
              onClick={closeCart}
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSlider;