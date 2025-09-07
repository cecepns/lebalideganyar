import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '../utils/api';

const BookingModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    number_of_people: 1,
    date: new Date(),
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchBookingStatus();
    }
  }, [isOpen]);

  const fetchBookingStatus = async () => {
    try {
      // Use the new optimized API endpoint that fetches all status data in one call
      const response = await api.getBookingStatus(30);
      
      console.log(response);
      if (response.success) {
        setBookingStatus(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch booking status');
      }
    } catch (error) {
      console.error('Error fetching booking status:', error);
      // Set default status for all dates if fetch fails
      const today = new Date();
      const statusMap = {};
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        statusMap[dateStr] = 'available';
      }
      setBookingStatus(statusMap);
    }
  };

  const getDayClassName = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const status = bookingStatus[dateStr];
    
    switch (status) {
      case 'blocked':
        return 'react-datepicker__day--highlighted-custom-1'; // Red - Date blocked (max_bookings = 0)
      case 'full':
        return 'react-datepicker__day--highlighted-custom-1'; // Red - Fully booked
      case 'almost-full':
        return 'react-datepicker__day--highlighted-custom-2'; // Yellow
      case 'available':
        return 'react-datepicker__day--highlighted-custom-3'; // Silver
      default:
        return '';
    }
  };

  const filterDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const status = bookingStatus[dateStr];
    
    // Prevent selection of blocked or full dates
    return status !== 'blocked' && status !== 'full';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.createBooking({
        ...formData,
        date: formData.date.toISOString().split('T')[0]
      });

      if (response.success) {
        alert('Booking created successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          number_of_people: 1,
          date: new Date(),
          notes: ''
        });
        onClose();
        // Refresh booking status after successful booking
        fetchBookingStatus();
      } else {
        alert('Error creating booking: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      // Show user-friendly error message even if backend is down
      alert('Error creating booking. Please try again later or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Book Appointment</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of People
              </label>
              <input
                type="number"
                name="number_of_people"
                value={formData.number_of_people}
                onChange={handleChange}
                min="1"
                max="50"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Date
              </label>
              <DatePicker
                selected={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                minDate={new Date()}
                filterDate={filterDate}
                dayClassName={getDayClassName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                dateFormat="dd/MM/yyyy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold text-gray-800 mb-2">Booking Status Legend:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                  <span>Red: Fully booked</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                  <span>Yellow: Almost full</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                  <span>Gray: Available</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

BookingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default BookingModal;