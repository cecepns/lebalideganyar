import { Booking } from '../models/Booking.js';
import { BookingLimit } from '../models/BookingLimit.js';

export const createBooking = async (req, res) => {
  try {
    const bookingId = await Booking.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { id: bookingId }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

export const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Max 100 items per page
    
    const result = await Booking.findAll({ page: pageNum, limit: limitNum });
    
    // Transform data to match frontend expectations
    const transformedBookings = result.data.map(booking => ({
      ...booking,
      date: booking.booking_date, // Map booking_date to date for frontend
      time: booking.booking_time  // Map booking_time to time for frontend
    }));
    
    res.json({
      success: true,
      data: transformedBookings,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const bookings = await Booking.findByDate(date);
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Booking.update(id, req.body);
    
    if (updated) {
      res.json({
        success: true,
        message: 'Booking updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking'
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await Booking.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch dashboard stats';
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection refused. Please check if MySQL server is running.';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorMessage = 'Database does not exist. Please create the booking_reservation database.';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Required tables do not exist. Please run the database migration.';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Database access denied. Please check your credentials.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process?.env?.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getBookingStatus = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const statusMap = {};
    
    // Get all dates to check
    const dates = [];
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
    }
    
    // Get booking counts for all dates in one query
    const bookingCounts = await Booking.getBookingCountsByDates(dates);
    
    // Get booking limits for all dates in one query
    const bookingLimits = await BookingLimit.getLimitsByDates(dates);
    
    // Process each date
    for (const dateStr of dates) {
      const bookingCount = bookingCounts[dateStr] || 0;
      const limitData = bookingLimits[dateStr];
      
      // Default max bookings if no limit is set
      const maxBookings = limitData ? limitData.max_bookings : 10;
      
      // Determine status based on business rules
      if (maxBookings === 0) {
        statusMap[dateStr] = 'blocked'; // Red - date blocked
      } else if (bookingCount >= maxBookings) {
        statusMap[dateStr] = 'full'; // Red - fully booked
      } else if (bookingCount >= maxBookings * 0.8) {
        statusMap[dateStr] = 'almost-full'; // Yellow - almost full
      } else {
        statusMap[dateStr] = 'available'; // Green/Gray - available
      }
    }
    
    res.json({
      success: true,
      data: statusMap
    });
  } catch (error) {
    console.error('Get booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking status'
    });
  }
};