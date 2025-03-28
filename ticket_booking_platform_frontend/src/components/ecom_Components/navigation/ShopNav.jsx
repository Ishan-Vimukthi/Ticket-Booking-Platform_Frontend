import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useCart } from '../../../contexts/CartContext';
 

const ShopNav = ({ onSearch }) => {
  const [scrolled, setScrolled] = useState(false);
  const { cartCount } = useCart();

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
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md" : "bg-transparent"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Home Link */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-xl font-bold ${scrolled ? "text-blue-600 hover:text-blue-800" : "text-white hover:text-blue-200"} transition-colors`}
            >
              BigIdea
            </Link>
            
            {/* Home Link to Main Event Page */}
            <Link 
              to="/" 
              className={`${scrolled ? "text-gray-600 hover:text-blue-600" : "text-white hover:text-blue-200"} transition-colors hidden md:block`}
            >
              Home (Events)
            </Link>
          </div>

          {/* Center Section - Category Links */}
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/shop/men" 
              className={`px-3 py-2 ${scrolled ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-200"} font-medium transition-colors`}
            >
              Men
            </Link>
            <Link 
              to="/shop/women" 
              className={`px-3 py-2 ${scrolled ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-200"} font-medium transition-colors`}
            >
              Women
            </Link>
          </div>

          {/* Right Section - Cart Icon */}
          <div className="flex items-center">
          <Link 
            to="/cart" 
            className={`p-2 relative transition-colors ${scrolled ? 'text-gray-400 hover:text-gray-600' : 'text-white hover:text-blue-200'}`}>
            <ShoppingCartIcon className="h-6 w-6" />
            {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
            </span>
           )}
          </Link>
          </div>
        </div>

        {/* Mobile Category Links (hidden on desktop) */}
        <div className={`md:hidden flex justify-center space-x-4 pb-2 ${scrolled ? "bg-white" : "bg-transparent"}`}>
          <Link 
            to="/shop/men" 
            className={`text-sm px-2 py-1 ${scrolled ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-200"}`}
          >
            Men
          </Link>
          <Link 
            to="/shop/women" 
            className={`text-sm px-2 py-1 ${scrolled ? "text-gray-700 hover:text-blue-600" : "text-white hover:text-blue-200"}`}
          >
            Women
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default ShopNav;