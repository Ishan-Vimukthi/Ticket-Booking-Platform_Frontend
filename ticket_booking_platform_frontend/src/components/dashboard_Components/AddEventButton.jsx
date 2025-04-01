import React, { useState } from "react";
import AddEventForm from "./AddEventForm";

const AddEventButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div className="p-4">
      {/* Button to open the modal */}
      <button
        onClick={openModal}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Create New Event
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeModal}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>

            {/* Event Form - Now with wider modal to accommodate two columns */}
            <div className="p-6 max-h-[90vh] overflow-y-auto">
              <AddEventForm onClose={closeModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEventButton;
