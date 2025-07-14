import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const D_Navbar = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        setAdminName(decodedToken.userName);
        setAdminEmail(decodedToken.email);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold px-15 lg:px-5 md:px-5"></h1>
      <div className="relative">
        <Menu>
          <MenuButton className="flex items-center space-x-2">
            <img src="/images/admin-profile.png" alt="Profile" className="w-10 h-10 rounded-full" />
            <span className="text-gray-700 font-medium">{adminName || "Admin"}</span>
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md">
            <MenuItem>
            <>
              <div className="pt-3 px-3 text-gray-600 ">{adminName || "Admin"}</div>
              <div className="px-3 text-gray-600">{adminEmail}</div>
            </> 
            </MenuItem>
            <MenuItem>
              <NavLink to="/edit-profile" className="block p-3 hover:bg-gray-200 border-b border-gray-300">Edit Profile</NavLink>
            </MenuItem>
            <MenuItem>
              <button onClick={handleSignOut} className="w-full text-left p-3 hover:bg-gray-200">Sign Out</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
};

export default D_Navbar
