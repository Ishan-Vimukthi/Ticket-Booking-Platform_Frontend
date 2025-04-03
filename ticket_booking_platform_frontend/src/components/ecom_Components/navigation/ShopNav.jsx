import { Link, useLocation } from "react-router-dom";
import { ShoppingCartIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCart } from '../../../contexts/CartContext';

const ShopNav = ({ onSearch }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, openCart, isCartOpen } = useCart();

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
    <nav className={`fixed w-full z-50 h-16 bg-black shadow-md transition-all duration-300`}>
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left Section - Back button on product page */}
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

          {/* Center Section - Product name on product page */}
          {isProductPage && (
            <div className="hidden md:flex text-white font-medium truncate max-w-xs">
              Acid Wash Jagger {/* Dynamic product name would go here */}
            </div>
          )}

          {/* Right Section - Cart icon */}
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
        {!isProductPage && (
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