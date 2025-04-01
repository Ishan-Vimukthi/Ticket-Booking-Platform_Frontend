import React from "react";

const DetailsCard = ({ title, description, value }) => {
  return (
    <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200">
      <h1 className="text-2xl font-bold mt-3">{title}</h1>
      <p className="text-sm text-gray-400">{description}</p>
      <p className="text-gray-600 text-2xl mt-4">{value}</p>
    </div>
  );
};

export default DetailsCard;
