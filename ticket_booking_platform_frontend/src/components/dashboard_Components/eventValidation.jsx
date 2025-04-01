export const validateEventForm = (formData, isUpdate = false) => {
  const errors = {
    eventName: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    venue: '',
    totalTickets: '',
    ticketTypes: ['', '', ''],
    image: '',
    status: ''
  };

  let isValid = true;

  // Event Name validation
  if (!formData.eventName.trim()) {
    errors.eventName = 'Event name is required';
    isValid = false;
  }

  // Event Description validation
  if (!formData.eventDescription.trim()) {
    errors.eventDescription = 'Description is required';
    isValid = false;
  } else if (formData.eventDescription.length < 20) {
    errors.eventDescription = 'Description must be at least 20 characters';
    isValid = false;
  }

  // Event Date validation
  if (!formData.eventDate) {
    errors.eventDate = 'Event date is required';
    isValid = false;
  } else {
    const selectedDate = new Date(formData.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      errors.eventDate = 'Event date cannot be in the past';
      isValid = false;
    }
  }

  // Event Time validation
  if (!formData.eventTime) {
    errors.eventTime = 'Event time is required';
    isValid = false;
  }

  // Venue validation
  if (!formData.venue) {
    errors.venue = 'Please select a venue';
    isValid = false;
  }

  // Total Tickets validation
  if (!formData.totalTickets) {
    errors.totalTickets = 'Total tickets is required';
    isValid = false;
  } else if (formData.totalTickets < 1) {
    errors.totalTickets = 'Must have at least 1 ticket';
    isValid = false;
  }

  // Ticket Prices validation
  formData.ticketTypes.forEach((ticket, index) => {
    if (ticket.price <= 0) {
      errors.ticketTypes[index] = 'Price must be greater than 0';
      isValid = false;
    }
  });

  // Image validation
  if (!isUpdate) {
    // For new events, image is required
    if (!formData.image) {
      errors.image = 'Event image is required';
      isValid = false;
    }
  }
  
  // Validate image type and size if a new image is provided (for both create and update)
  if (formData.image) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(formData.image.type)) {
      errors.image = 'Only JPG, PNG or GIF images are allowed';
      isValid = false;
    } else if (formData.image.size > 10 * 1024 * 1024) {
      errors.image = 'Image must be less than 10MB';
      isValid = false;
    }
  }

  return { errors, isValid };
};