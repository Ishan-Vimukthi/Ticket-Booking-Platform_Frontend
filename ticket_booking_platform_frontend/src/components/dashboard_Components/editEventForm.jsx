import React, { useState, useEffect } from "react";
import axios from "axios";
import { validateEventForm } from "./eventValidation";
import Notification from "./Notification";

const EditEventForm = ({ event, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    totalTickets: "",
    ticketTypes: [
      { type: "General", price: 0 },
      { type: "VIP", price: 0 },
      { type: "VVIP", price: 0 },
    ],
    image: null,
    status: "",
    currentImage: ""
  });

  const [errors, setErrors] = useState({
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    totalTickets: '',
    ticketTypes: ['', '', ''],
    image: '',
    status: ''
  });

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (event) {
      setFormData({
        eventName: event.eventName,
        eventDescription: event.eventDescription,
        eventDate: event.eventDate.split('T')[0],
        eventTime: event.eventTime,
        venue: event.venue,
        totalTickets: event.totalTickets,
        ticketTypes: event.ticketTypes || [
          { type: "General", price: 0 },
          { type: "VIP", price: 0 },
          { type: "VVIP", price: 0 },
        ],
        image: null,
        currentImage: event.image,
        status: event.status || ""
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleTicketTypeChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index][name] = value;
    setFormData({ ...formData, ticketTypes: updatedTicketTypes });

    if (name === 'price' && errors.ticketTypes[index]) {
      const newErrors = [...errors.ticketTypes];
      newErrors[index] = '';
      setErrors({ ...errors, ticketTypes: newErrors });
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
    if (errors.image) {
      setErrors({ ...errors, image: '' });
    }
  };

  const venues = [
    { id: "1", name: "Venue 1" },
    { id: "2", name: "Venue 2" },
    { id: "3", name: "Venue 3" },
  ];

  const statusOptions = [
    { id: "1", name: "Upcoming" },
    { id: "2", name: "Ongoing" },
    { id: "3", name: "Past" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pass true for isUpdate parameter to make image optional
    const { errors: validationErrors, isValid } = validateEventForm(formData, true);
    setErrors(validationErrors);

    if (!isValid) {
      setNotification({
        show: true,
        message: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    const data = new FormData();
    data.append("eventName", formData.eventName);
    data.append("eventDescription", formData.eventDescription);
    data.append("eventDate", formData.eventDate);
    data.append("eventTime", formData.eventTime);
    data.append("venue", formData.venue);
    data.append("totalTickets", formData.totalTickets);
    data.append("ticketTypes", JSON.stringify(formData.ticketTypes));
    if (formData.image) {
      data.append("image", formData.image);
    }
    data.append("status", formData.status);

    try {
      const response = await axios.patch(
        `http://localhost:3000/api/events/${event._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      setNotification({
        show: true,
        message: 'Event updated successfully!',
        type: 'success'
      });

      setTimeout(() => {
        onUpdate(response.data);
        onClose();
      }, 1500);

    } catch (error) {
      console.error("Error updating event:", error);
      setNotification({
        show: true,
        message: 'Failed to update event. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <>
      <div className="p-3 bg-white rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name
                </label>
                <input
                  type="text"
                  name="eventName"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={handleChange}
                  className={`mt-1 block w-full p-2 border ${
                    errors.eventName ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.eventName && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>
                )}
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Description
                </label>
                <textarea
                  name="eventDescription"
                  placeholder="Enter a detailed description of the event..."
                  value={formData.eventDescription}
                  onChange={handleChange}
                  rows={4}
                  className={`mt-1 block w-full p-2 border ${
                    errors.eventDescription ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.eventDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventDescription}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Event Date
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.eventDate ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Event Time
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.eventTime ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.eventTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.eventTime}</p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Image (Optional)
                </label>
                {formData.currentImage && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Current Image:</p>
                    <img 
                      src={`http://localhost:3000${formData.currentImage}`} 
                      alt="Current event" 
                      className="h-32 object-cover rounded"
                    />
                  </div>
                )}
                <div className={`flex justify-center px-6 pt-5 pb-6 border-2 ${
                  errors.image ? 'border-red-500' : 'border-gray-300'
                } border-dashed rounded-md`}>
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Change image (optional)</span>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Venue and Total Tickets */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Venue
                  </label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.venue ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select Venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.name}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                  {errors.venue && (
                    <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Tickets
                  </label>
                  <input
                    type="number"
                    name="totalTickets"
                    placeholder="Enter total tickets"
                    value={formData.totalTickets}
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.totalTickets ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.totalTickets && (
                    <p className="mt-1 text-sm text-red-600">{errors.totalTickets}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`mt-1 block w-full p-2 border ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>

              {/* Ticket Types */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Ticket Types</h3>
                
                {/* General Ticket */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    General Ticket
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="type"
                      value="General"
                      readOnly
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="w-1/2">
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.ticketTypes[0].price}
                        onChange={(e) => handleTicketTypeChange(0, e)}
                        className={`w-full p-2 border ${
                          errors.ticketTypes[0] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.ticketTypes[0] && (
                        <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[0]}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* VIP Ticket */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    VIP Ticket
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="type"
                      value="VIP"
                      readOnly
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="w-1/2">
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.ticketTypes[1].price}
                        onChange={(e) => handleTicketTypeChange(1, e)}
                        className={`w-full p-2 border ${
                          errors.ticketTypes[1] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.ticketTypes[1] && (
                        <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[1]}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* VVIP Ticket */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    VVIP Ticket
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="type"
                      value="VVIP"
                      readOnly
                      className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="w-1/2">
                      <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={formData.ticketTypes[2].price}
                        onChange={(e) => handleTicketTypeChange(2, e)}
                        className={`w-full p-2 border ${
                          errors.ticketTypes[2] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.ticketTypes[2] && (
                        <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[2]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Event
            </button>
          </div>
        </form>
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({...notification, show: false})}
        />
      )}
    </>
  );
};

export default EditEventForm;