import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Get current route path

  const menuItems = [
    { name: "Events", path: "/events" },
    { name: "Shop", path: "/shop" },
    { name: "Contact Us", path: "/contactus" },
    { name: "About Us", path: "/aboutus" },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <a href="/">
            <div className="text-2xl font-extrabold text-blue-600">BigIdea</div>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 justify-center flex-1 font-bold">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-black hover:text-blue-600 transition duration-300 ${
                  location.pathname === item.path ? "text-blue-600" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          
    

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white text-center font-bold">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block py-2 text-black hover:text-blue-600 transition duration-300 ${
                location.pathname === item.path ? "text-blue-600" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="py-2">
            <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition">
              Register
            </button>
          </div>
          <div className="pb-2">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Sign In
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
