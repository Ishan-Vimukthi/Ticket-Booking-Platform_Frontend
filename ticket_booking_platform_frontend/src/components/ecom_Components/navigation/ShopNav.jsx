import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const ShopNav = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo & Home Link */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              BigIdea
            </Link>
            
            {/* Home Link to Main Event Page */}
            <Link 
              to="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors hidden md:block"
            >
              Home (Events)
            </Link>
          </div>

          {/* Center Section - Category Links */}
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/shop/men" 
              className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Men
            </Link>
            <Link 
              to="/shop/women" 
              className="px-3 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Women
            </Link>
          </div>

          {/* Right Section - Cart Icon */}
          <div className="flex items-center">
            <Link 
              to="/cart" 
              className="p-2 text-gray-400 hover:text-gray-600 relative transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {/* Cart Badge - Will be dynamic later */}
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Category Links (hidden on desktop) */}
        <div className="md:hidden flex justify-center space-x-4 pb-2">
          <Link 
            to="/shop/men" 
            className="text-sm px-2 py-1 text-gray-700 hover:text-blue-600"
          >
            Men
          </Link>
          <Link 
            to="/shop/women" 
            className="text-sm px-2 py-1 text-gray-700 hover:text-blue-600"
          >
            Women
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default ShopNav;