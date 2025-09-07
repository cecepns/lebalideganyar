import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { api } from '../../utils/api';

const AdminReports = ({ user, onLogout }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '', // Empty string means no start date filter
    endDate: ''   // Empty string means no end date filter
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getBookings();
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      // If no date range is set, return all bookings
      if (!dateRange.startDate && !dateRange.endDate) {
        return true;
      }
      
      const bookingDate = new Date(booking.date);
      
      // If only start date is set
      if (dateRange.startDate && !dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        return bookingDate >= startDate;
      }
      
      // If only end date is set
      if (!dateRange.startDate && dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        return bookingDate <= endDate;
      }
      
      // If both dates are set
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  };

  const getReportData = () => {
    const filteredBookings = getFilteredBookings();
    
    // Group by date
    const groupedByDate = filteredBookings.reduce((acc, booking) => {
      const date = booking.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {});

    // Calculate daily stats
    const dailyStats = Object.entries(groupedByDate).map(([date, dayBookings]) => {
      const totalBookings = dayBookings.length;
      const confirmedBookings = dayBookings.filter(b => b.status === 'confirmed').length;
      const completedBookings = dayBookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = dayBookings.filter(b => b.status === 'cancelled').length;
      const revenue = dayBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0);

      return {
        date,
        totalBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        revenue
      };
    });

    return dailyStats.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getOverallStats = () => {
    const filteredBookings = getFilteredBookings();
    
    return {
      totalBookings: filteredBookings.length,
      confirmedBookings: filteredBookings.filter(b => b.status === 'confirmed').length,
      completedBookings: filteredBookings.filter(b => b.status === 'completed').length,
      cancelledBookings: filteredBookings.filter(b => b.status === 'cancelled').length,
      pendingBookings: filteredBookings.filter(b => b.status === 'pending').length,
      totalRevenue: filteredBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0),
      averageRevenue: filteredBookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.price || 0), 0) / 
        Math.max(filteredBookings.filter(b => b.status === 'completed').length, 1)
    };
  };

  const getServiceStats = () => {
    const filteredBookings = getFilteredBookings();
    
    const serviceCounts = filteredBookings.reduce((acc, booking) => {
      const service = booking.service || 'Unknown';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(serviceCounts).map(([service, count]) => ({
      service,
      count,
      percentage: ((count / filteredBookings.length) * 100).toFixed(1)
    }));
  };

  const exportToCSV = () => {
    const reportData = getReportData();
    const headers = ['Date', 'Total Bookings', 'Confirmed', 'Completed', 'Cancelled', 'Revenue'];
    
    // Helper function to format date for CSV
    const formatDateForCSV = (dateStr) => {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return dateStr; // Return original if invalid
        }
        
        // Format as DD-MM-YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
      } catch {
        return dateStr; // Return original if error
      }
    };
    
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => [
        formatDateForCSV(row.date),
        row.totalBookings,
        row.confirmedBookings,
        row.completedBookings,
        row.cancelledBookings,
        row.revenue
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const startDateStr = dateRange.startDate || 'all';
    const endDateStr = dateRange.endDate || 'all';
    a.download = `booking-summary-report-${startDateStr}-${endDateStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportDetailedCSV = () => {
    const filteredBookings = getFilteredBookings();
    const headers = ['Date', 'Time', 'Name', 'Email', 'Phone', 'Service', 'Price', 'Status', 'Notes'];
    
    // Helper function to format date for CSV
    const formatDateForCSV = (dateStr) => {
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          return dateStr; // Return original if invalid
        }
        
        // Format as DD-MM-YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
      } catch {
        return dateStr; // Return original if error
      }
    };

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(booking => [
        formatDateForCSV(booking.date),
        booking.time || '',
        escapeCSV(booking.name),
        escapeCSV(booking.email),
        escapeCSV(booking.phone),
        escapeCSV(booking.service || ''),
        booking.price || 0,
        escapeCSV(booking.status),
        escapeCSV(booking.notes || '')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const startDateStr = dateRange.startDate || 'all';
    const endDateStr = dateRange.endDate || 'all';
    a.download = `booking-details-${startDateStr}-${endDateStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const overallStats = getOverallStats();
  const reportData = getReportData();
  const serviceStats = getServiceStats();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
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
            className="px-3 py-2 font-medium text-sm rounded-md text-gray-500 hover:text-gray-700"
          >
            Booking Limits
          </button>
          <button
            onClick={() => navigate('/admin/reports')}
            className="px-3 py-2 font-medium text-sm rounded-md bg-blue-600 text-white"
          >
            Reports
          </button>
        </nav>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Report Filters</h2>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                placeholder="Start Date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                placeholder="End Date"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={() => setDateRange({ startDate: '', endDate: '' })}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Show All
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Export Summary CSV
              </button>
              <button
                onClick={exportDetailedCSV}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Export Detailed CSV
              </button>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalBookings}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.completedBookings}</p>
              </div>
            </div>
          </div>
          {/* <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-500 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rp {overallStats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Revenue</p>
                <p className="text-2xl font-bold text-gray-900">Rp {overallStats.averageRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Daily Report Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Report</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confirmed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cancelled
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((row) => (
                  <tr key={row.date} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.totalBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.confirmedBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.completedBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.cancelledBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {row.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Statistics */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Service Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceStats.map((service) => (
              <div key={service.service} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">{service.service}</h4>
                <p className="text-2xl font-bold text-primary-600">{service.count}</p>
                <p className="text-sm text-gray-500">{service.percentage}% of total</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Booking List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Booking List</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredBookings().map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(booking.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.time || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.service || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {(booking.price || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {getFilteredBookings().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found for the selected date range.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AdminReports.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired
};

export default AdminReports;
