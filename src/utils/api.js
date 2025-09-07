const API_BASE_URL = 'https://api-inventory.isavralabel.com/lebalideganyar/api';

export const api = {
  // Booking endpoints
  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    return response.json();
  },

  getBookings: async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/bookings?page=${page}&limit=${limit}`);
    return response.json();
  },

  updateBooking: async (id, bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    return response.json();
  },

  deleteBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  getBookingsByDate: async (date) => {
    const response = await fetch(`${API_BASE_URL}/bookings/date/${date}`);
    return response.json();
  },

  getBookingStatus: async (days = 30) => {
    const response = await fetch(`${API_BASE_URL}/bookings/status?days=${days}`);
    return response.json();
  },

  // Admin endpoints
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // Booking limits endpoints
  setBookingLimit: async (date, maxBookings) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, maxBookings }),
    });
    return response.json();
  },

  getBookingLimit: async (date) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits/date/${date}`);
    return response.json();
  },

  getAllBookingLimits: async () => {
    const response = await fetch(`${API_BASE_URL}/booking-limits`);
    return response.json();
  },

  updateBookingLimit: async (date, maxBookings) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits/date/${date}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maxBookings }),
    });
    return response.json();
  },

  deleteBookingLimit: async (date) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits/date/${date}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // ID-based booking limits endpoints (preferred)
  getBookingLimitById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits/${id}`);
    return response.json();
  },

  updateBookingLimitById: async (id, maxBookings) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ maxBookings }),
    });
    return response.json();
  },

  deleteBookingLimitById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/booking-limits/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
    return response.json();
  }
};