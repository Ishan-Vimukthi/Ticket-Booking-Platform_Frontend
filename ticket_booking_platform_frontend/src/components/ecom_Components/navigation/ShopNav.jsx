import { Link } from "react-router-dom";
import { ShoppingCartIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCart } from '../../../contexts/CartContext';

const ShopNav = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-black shadow-md" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Home Button & Logo */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Go to home"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <Link 
              to="/" 
              className={`text-xl font-bold text-white hover:text-gray-300 transition-colors`}
            >
              BigIdea
            </Link>
          </div>

          {/* Center Section - Category Links */}
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/shop/men" 
              className={`px-3 py-2 text-white hover:text-gray-300 font-medium transition-colors hover:underline underline-offset-4`}
            >
              FOR HIM
            </Link>
            <Link 
              to="/shop/women" 
              className={`px-3 py-2 text-white hover:text-gray-300 font-medium transition-colors hover:underline underline-offset-4`}
            >
              FOR HER
            </Link>
          </div>

          {/* Right Section - Cart Icon */}
          <div className="flex items-center">
            <button 
              onClick={toggleCart}
              className={`p-2 relative text-white hover:text-gray-300 transition-colors`}
              aria-label="Shopping cart"
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

        {/* Mobile Category Links (hidden on desktop) */}
        <div className={`md:hidden flex justify-center space-x-4 pb-2 ${scrolled ? "bg-black" : "bg-transparent"}`}>
          <Link 
            to="/shop/men" 
            className={`text-sm px-2 py-1 text-white hover:text-gray-300`}
          >
            FOR HIM
          </Link>
          <Link 
            to="/shop/women" 
            className={`text-sm px-2 py-1 text-white hover:text-gray-300`}
          >
            FOR HER
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default ShopNav;