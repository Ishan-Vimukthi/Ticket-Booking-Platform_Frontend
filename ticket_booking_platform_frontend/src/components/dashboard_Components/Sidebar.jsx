import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BarChart, Calendar, Map, FileText, Menu, X, Edit, LogOut } from "lucide-react"; // Import icons
import { useAuth } from "../../contexts/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // State to control sidebar visibility

  const menuItems = [
    { name: "Analytics", path: "/admin/dashboard", icon: <BarChart size={20} /> },
    {
      name: "Manage Events",
      path: "/admin/manage-event",
      icon: <Calendar size={20} />,
    },
    {
      name: "Manage Reports",
      path: "/admin/reporting",
      icon: <FileText size={20} />,
    },
    { name: "Seat Mapping Tool", 
      path: "/admin/seat-map", 
      icon: <Map size={20} /> },
    
    { name: "Edit Profile", 
      path: "/admin/edit-profile", 
      icon: <Edit size={20} /> },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      {/* Sidebar Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bg-white h-full shadow-lg transition-transform duration-300 w-64 p-5 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:w-80 z-40`}
      >
        <NavLink to="/">
          <div className="text-3xl font-extrabold text-blue-600 mb-10 pl-12">
            BigIdea
          </div>
        </NavLink>
        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 py-5 px-6 rounded-xl m-2 font-bold text-black hover:bg-gray-200 ${
                location.pathname === item.path
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : ""
              }`}
              onClick={() => setIsOpen(false)} // Close sidebar on item click (mobile)
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 py-3 px-13 md:px-20 lg:px-20 rounded-xl m-5 font-bold text-white bg-blue-600 hover:bg-blue-700"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;