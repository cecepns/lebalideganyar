import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingsByDate,
  updateBooking,
  deleteBooking,
  getDashboardStats,
  getBookingStatus
} from '../controllers/bookingController.js';

const router = express.Router();

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/status', getBookingStatus);
router.get('/date/:date', getBookingsByDate);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;