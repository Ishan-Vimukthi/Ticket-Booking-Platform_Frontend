import React, { useState, useEffect } from "react";
import axios from "axios";
import Notification from "./Notification";
import { validateEventForm } from "./eventValidation";

const AddEventForm = ({ onClose, onEventCreated = () => {} }) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    totalTickets: "",
    ticketTypes: [
      { type: "General", price: "" },
      { type: "VIP", price: "" },
      { type: "VVIP", price: "" },
    ],
    image: null,
    status: "Upcoming",
    cancellationPossible: false,
  });

  const [errors, setErrors] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    totalTickets: "",
    ticketTypes: ["", "", ""],
    image: "",
    status: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // State for venues from backend
  const [venues, setVenues] = useState([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [venueError, setVenueError] = useState("");

  const statusOptions = [
    { id: "1", name: "Upcoming" },
    { id: "2", name: "Ongoing" },
    { id: "3", name: "Completed" },
  ];

  // Fetch venues from backend on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/venues`);
        
        // Check if response.data exists and is an array
        if (!response.data) {
          throw new Error("No data received from venues API");
        }

        // Check if data is in the expected format
        if (!Array.isArray(response.data)) {
          // Handle case where data might be nested (common with some APIs)
          if (response.data.data && Array.isArray(response.data.data)) {
            setVenues(response.data.data);
          } else if (response.data.venues && Array.isArray(response.data.venues)) {
            setVenues(response.data.venues);
          } else {
            throw new Error("Invalid venues data format");
          }
        } else {
          setVenues(response.data);
        }

        setVenueError("");
      } catch (error) {
        console.error("Error fetching venues:", error);
        setVenues([]);
        setVenueError(error.message || "Failed to load venues");
        setNotification({
          show: true,
          message: error.message || "Failed to load venues",
          type: "error",
        });
      } finally {
        setIsLoadingVenues(false);
      }
    };

    fetchVenues();
  }, [API_BASE]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // If venue is changed, update totalTickets
    if (name === "venue") {
      const selectedVenue = venues.find(v => v._id === value);
      if (selectedVenue) {
        setFormData(prev => ({
          ...prev,
          totalTickets: selectedVenue.totalSeats || "",
          venue: value
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleTicketTypeChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index] = {
      ...updatedTicketTypes[index],
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    };

    setFormData((prev) => ({ ...prev, ticketTypes: updatedTicketTypes }));

    // Clear error for this ticket type
    if (errors.ticketTypes?.[index]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors.ticketTypes) {
          newErrors.ticketTypes[index] = "";
        }
        return newErrors;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // First check if image is selected
    if (!formData.image) {
      setErrors((prev) => ({ ...prev, image: "Event image is required" }));
      setNotification({
        show: true,
        message: "Please select an event image",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate form
    const { errors: validationErrors, isValid } = validateEventForm(formData);
    setErrors(validationErrors);

    if (!isValid) {
      setNotification({
        show: true,
        message: "Please fix the form errors",
        type: "error",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append only the required fields first
      formDataToSend.append("eventName", formData.eventName.trim());
      formDataToSend.append("eventDate", formData.eventDate);
      formDataToSend.append("eventTime", formData.eventTime);
      formDataToSend.append("venue", formData.venue);
      formDataToSend.append("totalTickets", formData.totalTickets);
      formDataToSend.append("image", formData.image); // Required by server
      formDataToSend.append("cancellationPossible", formData.cancellationPossible);

      // Only append optional fields if they exist
      if (formData.eventDescription) {
        formDataToSend.append(
          "eventDescription",
          formData.eventDescription.trim()
        );
      }

      // For ticketTypes, try sending as array instead of JSON string
      formData.ticketTypes.forEach((ticket, index) => {
        formDataToSend.append(`ticketTypes[${index}][type]`, ticket.type);
        formDataToSend.append(`ticketTypes[${index}][price]`, ticket.price);
      });

      const response = await axios.post(
        `${API_BASE}/api/events`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Handle success response
      setNotification({
        show: true,
        message: "Event created successfully!",
        type: "success",
      });
      
      // Call the onEventCreated callback with the response data
      onEventCreated(response.data);
      
    } catch (error) {
      console.error("Error creating event:", error);
      setNotification({
        show: true,
        message: error.response?.data?.message || "Failed to create event",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
      window.location.reload();
      // Only close the form if there was no error
      if (!notification.show || notification.type === "success") {
        onClose();
      }
    }
  };

  return (
    <>
      <div className="p-3 bg-white rounded-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Add Event
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name *
                </label>
                <input
                  type="text"
                  name="eventName"
                  placeholder="Enter event name"
                  value={formData.eventName}
                  onChange={handleChange}
                  className={`mt-1 block w-full p-2 border ${
                    errors.eventName ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.eventName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventName}
                  </p>
                )}
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Description *
                </label>
                <textarea
                  name="eventDescription"
                  placeholder="Enter a detailed description of the event..."
                  value={formData.eventDescription}
                  onChange={handleChange}
                  rows={4}
                  className={`mt-1 block w-full p-2 border ${
                    errors.eventDescription
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                />
                {errors.eventDescription && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.eventDescription}
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={`mt-1 block w-full p-2 border ${
                      errors.eventDate ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.eventDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Event Time *
                  </label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.eventTime ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.eventTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.eventTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Image *
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
                    errors.image ? "border-red-500" : "border-gray-300"
                  } border-dashed rounded-md`}
                >
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
                        <span>Upload an image</span>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          onChange={handleImageChange}
                          className="sr-only"
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
                {formData.image && (
                  <p className="mt-1 text-sm text-green-600">
                    Selected: {formData.image.name}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Venue and Total Tickets */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Venue *
                  </label>
                  {isLoadingVenues ? (
                    <div className="mt-1 p-2 border border-gray-300 rounded-md bg-gray-100 animate-pulse">
                      Loading venues...
                    </div>
                  ) : venueError ? (
                    <div className="mt-1 p-2 border border-red-300 rounded-md bg-red-50 text-red-600">
                      {venueError}
                    </div>
                  ) : (
                    <>
                      <select
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        className={`mt-1 block w-full p-2 border ${
                          errors.venue ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select Venue</option>
                        {venues.map((venue) => (
                          <option key={venue._id} value={venue._id}>
                            {venue.name} ({venue.totalSeats || 0} seats)
                          </option>
                        ))}
                      </select>
                      {errors.venue && (
                        <p className="mt-1 text-sm text-red-600">{errors.venue}</p>
                      )}
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Tickets *
                  </label>
                  <input
                    type="number"
                    name="totalTickets"
                    placeholder="Enter total tickets"
                    min="1"
                    value={formData.totalTickets}
                    onChange={handleChange}
                    className={`mt-1 block w-full p-2 border ${
                      errors.totalTickets ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.totalTickets && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.totalTickets}
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ticket Types */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Ticket Types *
                </h3>

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
                        min="0"
                        step="0.01"
                        value={formData.ticketTypes[0].price}
                        onChange={(e) => handleTicketTypeChange(0, e)}
                        className={`w-full p-2 border ${
                          errors.ticketTypes?.[0]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.ticketTypes?.[0] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ticketTypes[0]}
                        </p>
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
                        min="0"
                        step="0.01"
                        value={formData.ticketTypes[1].price}
                        onChange={(e) => handleTicketTypeChange(1, e)}
                        className={`w-full p-2 border ${
                          errors.ticketTypes?.[1]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.ticketTypes?.[1] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ticketTypes[1]}
                        </p>
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
                        min="0"
                        step="0.01"
                        value={formData.ticketTypes[2].price}
                        onChange={(e) => handleTicketTypeChange(2, e)}
                        className={`w-full p-2 border ${
                          errors.ticketTypes?.[2]
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.ticketTypes?.[2] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.ticketTypes[2]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket Cancellation Checkbox */}
          <div className="mt-0 ml-106 flex items-center">
            <input
              type="checkbox"
              id="cancellationPossible"
              name="cancellationPossible"
              checked={formData.cancellationPossible}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="cancellationPossible" className="ml-2 block text-sm text-gray-700">
              Ticket cancellation is possible
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || venueError}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting || venueError ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>

      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
};

export default AddEventForm;