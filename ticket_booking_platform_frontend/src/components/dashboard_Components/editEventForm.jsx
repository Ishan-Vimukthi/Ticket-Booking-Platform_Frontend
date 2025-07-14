import React, { useState, useEffect } from "react";
import axios from "axios";

const EditEventForm = ({ event, onClose, onUpdate, venues }) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    venueName: "",
    totalTickets: "",
    ticketTypes: [
      { type: "General", price: 0 },
      { type: "VIP", price: 0 },
      { type: "VVIP", price: 0 },
    ],
    image: null,
    status: "Upcoming",
    currentImage: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    if (event) {
      const formattedDate = event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "";
      const venue = venues.find(v => v._id === event.venue);
      
      setFormData({
        eventName: event.eventName || "",
        eventDescription: event.eventDescription || "",
        eventDate: formattedDate,
        eventTime: event.eventTime || "",
        venue: event.venue || "",
        venueName: venue ? venue.name : "",
        totalTickets: event.totalTickets?.toString() || "",
        ticketTypes: event.ticketTypes || [
          { type: "General", price: 0 },
          { type: "VIP", price: 0 },
          { type: "VVIP", price: 0 },
        ],
        image: null,
        currentImage: event.image || "",
        status: event.status || "Upcoming"
      });
    }
  }, [event, venues]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventName.trim()) newErrors.eventName = "Event name is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.eventTime) newErrors.eventTime = "Event time is required";
    if (!formData.venue.trim()) newErrors.venue = "Venue is required";
    if (!formData.totalTickets || parseInt(formData.totalTickets) <= 0) 
      newErrors.totalTickets = "Valid ticket quantity is required";
    
    formData.ticketTypes.forEach((ticket, index) => {
      if (ticket.price < 0) {
        newErrors.ticketTypes = newErrors.ticketTypes || [];
        newErrors.ticketTypes[index] = "Price cannot be negative";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "venue") {
      const selectedVenue = venues.find(v => v._id === value);
      setFormData(prev => ({ 
        ...prev, 
        venue: value,
        venueName: selectedVenue ? selectedVenue.name : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTicketTypeChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTicketTypes = [...formData.ticketTypes];
    updatedTicketTypes[index] = { 
      ...updatedTicketTypes[index], 
      [name]: name === 'price' ? parseFloat(value) || 0 : value 
    };
    
    setFormData(prev => ({ ...prev, ticketTypes: updatedTicketTypes }));

    if (errors.ticketTypes?.[index]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors.ticketTypes) {
          newErrors.ticketTypes[index] = '';
        }
        return newErrors;
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 10 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Only JPG, PNG or GIF images are allowed' }));
        return;
      }
      
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 10MB' }));
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("eventName", formData.eventName);
      formDataToSend.append("eventDescription", formData.eventDescription);
      formDataToSend.append("eventDate", formData.eventDate);
      formDataToSend.append("eventTime", formData.eventTime);
      formDataToSend.append("venue", formData.venue);
      formDataToSend.append("totalTickets", formData.totalTickets);
      formDataToSend.append("ticketTypes", JSON.stringify(formData.ticketTypes));
      formDataToSend.append("status", formData.status);
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await axios.put(
        `${API_BASE}/api/events/${event._id}`,
        formDataToSend,
        {
          headers: { 
            "Content-Type": "multipart/form-data"
          }
        }
      );

      setNotification({
        show: true,
        message: 'Event updated successfully!',
        type: 'success'
      });

      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      let errorMessage = 'Failed to update event. Please try again.';
      
      if (error.response) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.errors) {
          setErrors(error.response.data.errors);
          errorMessage = 'Please fix the form errors';
        }
      }

      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = () => {
    if (!formData.currentImage) return '';
    if (formData.currentImage.startsWith('http')) return formData.currentImage;
    return `${API_BASE}${formData.currentImage}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Edit Event</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {notification.show && (
            <div className={`mb-4 p-3 rounded-md ${
              notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}>
              {notification.message}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.eventName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.eventName && <p className="mt-1 text-sm text-red-600">{errors.eventName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Description
                  </label>
                  <textarea
                    name="eventDescription"
                    value={formData.eventDescription}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full p-2 border rounded-md ${
                      errors.eventDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.eventDescription && <p className="mt-1 text-sm text-red-600">{errors.eventDescription}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      value={formData.eventDate}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${
                        errors.eventDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.eventDate && <p className="mt-1 text-sm text-red-600">{errors.eventDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Time *
                    </label>
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${
                        errors.eventTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.eventTime && <p className="mt-1 text-sm text-red-600">{errors.eventTime}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Image
                  </label>
                  {formData.currentImage && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-500 mb-1">Current Image:</p>
                      <img 
                        src={getImageUrl()} 
                        alt="Current event" 
                        className="h-40 w-full object-cover rounded border"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzk5OSI+RXZlbnQgSW1hZ2U8L3RleHQ+PC9zdmc+';
                          e.target.className = 'h-40 w-full object-contain p-4 bg-gray-100 rounded border';
                        }}
                      />
                    </div>
                  )}
                  <div className={`border-2 border-dashed rounded-md p-4 ${
                    errors.image ? 'border-red-500' : 'border-gray-300'
                  }`}>
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Upload new image
                          </span>
                          <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                  {formData.image && (
                    <p className="mt-1 text-sm text-green-600">New image selected: {formData.image.name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue *
                    </label>
                    <select
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${
                        errors.venue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select a venue</option>
                      {venues.map(venue => (
                        <option key={venue._id} value={venue._id}>
                          {venue.name}
                        </option>
                      ))}
                    </select>
                    {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue}</p>}
                    {formData.venueName && (
                      <p className="mt-1 text-sm text-gray-500">Selected: {formData.venueName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Tickets *
                    </label>
                    <input
                      type="number"
                      name="totalTickets"
                      min="1"
                      value={formData.totalTickets}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded-md ${
                        errors.totalTickets ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.totalTickets && <p className="mt-1 text-sm text-red-600">{errors.totalTickets}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded-md ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Ticket Types *</h3>
                  
                  {formData.ticketTypes.map((ticket, index) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {ticket.type} Ticket
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          name="type"
                          value={ticket.type}
                          readOnly
                          className="w-1/2 p-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                        <div className="w-1/2">
                          <input
                            type="number"
                            name="price"
                            min="0"
                            step="0.01"
                            value={ticket.price}
                            onChange={(e) => handleTicketTypeChange(index, e)}
                            className={`w-full p-2 border rounded-md ${
                              errors.ticketTypes?.[index] ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                          />
                          {errors.ticketTypes?.[index] && (
                            <p className="mt-1 text-sm text-red-600">{errors.ticketTypes[index]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventForm;