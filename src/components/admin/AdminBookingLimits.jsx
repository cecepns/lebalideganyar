import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import { api } from '../../utils/api';

const AdminBookingLimits = ({ user, onLogout }) => {
  const [bookingLimits, setBookingLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLimit, setEditingLimit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newLimit, setNewLimit] = useState({
    date: new Date(),
    maxBookings: 10
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookingLimits();
  }, []);

  const fetchBookingLimits = async () => {
    try {
      setLoading(true);
      const response = await api.getAllBookingLimits();
      if (response.success) {
        setBookingLimits(response.data);
      }
    } catch (error) {
      console.error('Error fetching booking limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLimit = async (e) => {
    e.preventDefault();
    try {
      const dateString = newLimit.date.toISOString().split('T')[0];
      const response = await api.setBookingLimit(dateString, parseInt(newLimit.maxBookings));
      if (response.success) {
        setShowAddModal(false);
        setNewLimit({ date: new Date(), maxBookings: 10 });
        fetchBookingLimits();
        alert('Booking limit added successfully!');
      } else {
        alert('Error adding booking limit: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding booking limit:', error);
      alert('Error adding booking limit. Please try again.');
    }
  };

  const handleEditLimit = (limit) => {
    setEditingLimit({
      ...limit,
      date: new Date(limit.date)
    });
    setShowEditModal(true);
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    try {
      // Use ID-based update (more reliable)
      const response = await api.updateBookingLimitById(editingLimit.id, parseInt(editingLimit.max_bookings));
      if (response.success) {
        setShowEditModal(false);
        setEditingLimit(null);
        fetchBookingLimits();
        alert('Booking limit updated successfully!');
      } else {
        alert('Error updating booking limit: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating booking limit:', error);
      alert('Error updating booking limit. Please try again.');
    }
  };

  const handleDeleteLimit = async (limit) => {
    if (window.confirm('Are you sure you want to delete this booking limit?')) {
      try {
        // Use ID-based delete (more reliable)
        const response = await api.deleteBookingLimitById(limit.id);
        if (response.success) {
          fetchBookingLimits();
          alert('Booking limit deleted successfully!');
        } else {
          alert('Error deleting booking limit: ' + (response.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error deleting booking limit:', error);
        alert('Error deleting booking limit. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  // Pagination logic
  const totalPages = Math.ceil(bookingLimits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookingLimits = bookingLimits.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(parseInt(newItemsPerPage));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking limits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Booking Limits</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.username}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex space-x-8 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700"
          >
            Manage Bookings
          </button>
          <button
            onClick={() => navigate('/admin/booking-limits')}
            className="px-3 py-2 font-medium text-sm rounded-md bg-blue-600 text-white"
          >
            Booking Limits
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700"
          >
            Reports
          </button>
        </nav>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Manage Booking Limits by Date</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add New Limit
            </button>
          </div>

          {/* Pagination Controls */}
          {bookingLimits.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, bookingLimits.length)} of {bookingLimits.length} entries
                </span>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookingLimits.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No booking limits set. Add some to control booking availability.
                    </td>
                  </tr>
                ) : (
                  currentBookingLimits.map((limit) => (
                    <tr key={limit.date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(limit.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {limit.max_bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditLimit(limit)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteLimit(limit)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {bookingLimits.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={page === '...'}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        page === '...'
                          ? 'text-gray-500 cursor-default'
                          : page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Limit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Add New Booking Limit
              </h3>
              <form onSubmit={handleAddLimit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <DatePicker
                    selected={newLimit.date}
                    onChange={(date) => setNewLimit({ ...newLimit, date })}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Bookings
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newLimit.maxBookings}
                    onChange={(e) => setNewLimit({ ...newLimit, maxBookings: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Limit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Limit Modal */}
      {showEditModal && editingLimit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Edit Booking Limit
              </h3>
              <form onSubmit={handleUpdateLimit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={formatDate(editingLimit.date)}
                    disabled
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Bookings
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingLimit.max_bookings}
                    onChange={(e) => setEditingLimit({ 
                      ...editingLimit, 
                      max_bookings: e.target.value 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Limit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

AdminBookingLimits.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired
};

export default AdminBookingLimits;
