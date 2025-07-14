import { Link, useLocation } from "react-router-dom";
import { ShoppingCartIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCart } from '../../../contexts/CartContext';

const ShopNav = ({ onSearch }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, openCart } = useCart();

  const isProductPage = location.pathname.includes('/product/');
  const isCheckoutPage = location.pathname.includes('/checkout');
  const isShopPage = location.pathname === '/shop';

  useEffect(() => {
    // Immediately set solid black for non-shop pages
    if (!isShopPage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 50;
      setScrolled(shouldBeScrolled);
    };

    // Set initial state
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isShopPage]);

  return (
    <nav className={`fixed w-full z-50 h-16 transition-all duration-300 ${
      scrolled ? 'bg-black shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {isProductPage || isCheckoutPage ? (
              <Link 
                to="/shop" 
                className="text-white hover:text-gray-300 transition-colors flex items-center"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Back to Shop</span>
              </Link>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <Link 
                  to="/shop" 
                  className="text-m font-bold text-white hover:text-gray-300 transition-colors"
                >
                  EVENTS
                </Link>
              </>
            )}
          </div>

          {/* Center Section - Only show on shop page */}
          {isShopPage && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-xl text-white font-bold uppercase tracking-wider">
                BIG IDEA STORE
              </span>
            </div>
          )}

          {/* Show product title on product pages */}
          {isProductPage && (
            <div className="hidden md:flex text-white font-medium">
              Product Details
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center">
            <button 
              onClick={openCart}
              className="p-2 relative text-white hover:text-gray-300 transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile category links - only on shop page */}
        {isShopPage && (
          <div className={`md:hidden flex justify-center space-x-4 py-2 ${
            scrolled ? 'bg-black' : 'bg-transparent'
          }`}>
            <Link 
              to="/shop/men" 
              className="text-sm px-2 py-1 text-white hover:text-gray-300"
            >
              FOR HIM
            </Link>
            <Link 
              to="/shop/women" 
              className="text-sm px-2 py-1 text-white hover:text-gray-300"
            >
              FOR HER
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ShopNav;