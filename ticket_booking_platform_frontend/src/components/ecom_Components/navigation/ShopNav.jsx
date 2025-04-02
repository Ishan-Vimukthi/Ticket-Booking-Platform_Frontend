import { Link, useLocation } from "react-router-dom";
import { ShoppingCartIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCart } from '../../../contexts/CartContext';

const ShopNav = ({ onSearch }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, openCart } = useCart();

  // Check if current route is product page
  const isProductPage = location.pathname.includes('/product/');

  useEffect(() => {
    if (!isProductPage) {
      const handleScroll = () => {
        const isScrolled = window.scrollY > 50;
        if (isScrolled !== scrolled) {
          setScrolled(isScrolled);
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [scrolled, isProductPage]);

  return (
    <nav className={`fixed w-full z-30 transition-all duration-300 ${
      isProductPage ? 'bg-black shadow-md' : 
      scrolled ? 'bg-black shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {isProductPage ? (
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
                  className="text-xl font-bold text-white hover:text-gray-300 transition-colors"
                >
                  BigIdea
                </Link>
              </>
            )}
          </div>

          {/* Center Section - Only show on shop page */}
          {!isProductPage && (
            <div className="hidden md:flex space-x-6">
              <Link 
                to="/shop/men" 
                className="px-3 py-2 text-white hover:text-gray-300 font-medium transition-colors"
              >
                FOR HIM
              </Link>
              <Link 
                to="/shop/women" 
                className="px-3 py-2 text-white hover:text-gray-300 font-medium transition-colors"
              >
                FOR HER
              </Link>
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

        {/* Mobile Category Links - Only show on shop page */}
        {!isProductPage && (
          <div className={`md:hidden flex justify-center space-x-4 pb-2 ${
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