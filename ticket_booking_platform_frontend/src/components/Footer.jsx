import React from "react";
import { Mail, Facebook } from "lucide-react";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";

const Footer = () => {
  return (
    <div>
      <div className="bg-blue-900 text-white p-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
          {/* Left Side - BigIdea Group */}
          <div className="md:w-1/2">
            <h1 className="text-2xl font-bold pb-2">BigIdea Group</h1>
            <p className="text-sm">
              BigIdea Group, Australia's premier event organizing company,
              provides a platform for purchasing tickets to all our
              entertainment events in Australia.
            </p>
            <div className="flex space-x-2 pt-2">
              <FaCcVisa size={24} className="text-white" />
              <FaCcMastercard size={24} className="text-white" />
            </div>
          </div>

          {/* Right Side - Contact */}
          <div className="md:w-1/2 md:text-left mt-10 md:mt-0 pl-0 md:pl-20 lg:pl-50">
            <h1 className="text-2xl font-bold">Contact</h1>
            <div className="flex items-center md:justify-start space-x-2 mt-2">
              <Mail size={24} className="text-white" />
              <p className="text-white">support@bigidea.com</p>
            </div>
            <div className="flex items-center md:justify-start space-x-2 mt-2">
              <Facebook size={24} className="text-white" />
              <p className="text-white">bigidea-group</p>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="bg-blue-950 text-white p-4">
        <div className="max-w-6xl mx-auto text-center text-sm">
          <p>&copy; 2025 BigIdea Group. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
