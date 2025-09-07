import { BookingLimit } from '../models/BookingLimit.js';

export const setBookingLimit = async (req, res) => {
  try {
    const { date, maxBookings } = req.body;
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    await BookingLimit.create(normalizedDate, maxBookings);
    
    res.json({
      success: true,
      message: 'Booking limit set successfully'
    });
  } catch (error) {
    console.error('Set booking limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set booking limit'
    });
  }
};

export const getBookingLimit = async (req, res) => {
  try {
    const { date } = req.params;
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    const limit = await BookingLimit.findByDate(normalizedDate);
    
    res.json({
      success: true,
      data: limit || { maxBookings: 10 } // Default limit
    });
  } catch (error) {
    console.error('Get booking limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking limit'
    });
  }
};

export const getAllBookingLimits = async (req, res) => {
  try {
    const limits = await BookingLimit.findAll();
    res.json({
      success: true,
      data: limits
    });
  } catch (error) {
    console.error('Get all booking limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking limits'
    });
  }
};

export const updateBookingLimit = async (req, res) => {
  try {
    const { date } = req.params;
    const { maxBookings } = req.body;
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    const updated = await BookingLimit.update(normalizedDate, maxBookings);
    
    if (updated) {
      res.json({
        success: true,
        message: 'Booking limit updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
  } catch (error) {
    console.error('Update booking limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking limit'
    });
  }
};

export const deleteBookingLimit = async (req, res) => {
  try {
    const { date } = req.params;
    
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    console.log('Deleting booking limit for date:', normalizedDate);
    
    // First check if the limit exists
    const existing = await BookingLimit.findByDate(normalizedDate);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
    
    const deleted = await BookingLimit.delete(normalizedDate);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Booking limit deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
  } catch (error) {
    console.error('Delete booking limit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking limit'
    });
  }
};

// ID-based functions (preferred approach)
export const getBookingLimitById = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = await BookingLimit.findById(id);
    
    if (!limit) {
      return res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
    
    res.json({
      success: true,
      data: limit
    });
  } catch (error) {
    console.error('Get booking limit by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking limit'
    });
  }
};

export const updateBookingLimitById = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxBookings } = req.body;
    
    // First check if the limit exists
    const existing = await BookingLimit.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
    
    const updated = await BookingLimit.updateById(id, maxBookings);
    
    if (updated) {
      res.json({
        success: true,
        message: 'Booking limit updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
  } catch (error) {
    console.error('Update booking limit by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking limit'
    });
  }
};

export const deleteBookingLimitById = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting booking limit with ID:', id);
    
    // First check if the limit exists
    const existing = await BookingLimit.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
    
    const deleted = await BookingLimit.deleteById(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Booking limit deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Booking limit not found'
      });
    }
  } catch (error) {
    console.error('Delete booking limit by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking limit'
    });
  }
};