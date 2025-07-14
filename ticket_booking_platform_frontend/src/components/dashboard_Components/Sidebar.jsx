import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { BarChart, Calendar, Map, FileText, Menu, X, Edit, Users } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // State to control sidebar visibility

  const menuItems = [
    { name: "Analytics", path: "/admin", icon: <BarChart size={20} /> },
    { name: "Manage Events", path: "/manage-event", icon: <Calendar size={20} /> },
    { name: "Seat Mapping Tool", path: "/seat-map", icon: <Map size={20} /> },
    { name: "Edit Profile", path: "/edit-profile", icon: <Edit size={20} /> },
    { name: "Manage Reports", path: "/reporting", icon: <FileText size={20} /> },
    { name: "Manage Admins", path: "/manage-admins", icon: <Users size={20} /> },
  ];

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
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;