import express from 'express';
import { 
  setBookingLimit, 
  getBookingLimit, 
  getAllBookingLimits, 
  updateBookingLimit, 
  deleteBookingLimit,
  getBookingLimitById,
  updateBookingLimitById,
  deleteBookingLimitById
} from '../controllers/bookingLimitController.js';

const router = express.Router();

// Date-based routes (for backward compatibility)
router.post('/', setBookingLimit);
router.get('/', getAllBookingLimits);
router.get('/date/:date', getBookingLimit);
router.put('/date/:date', updateBookingLimit);
router.delete('/date/:date', deleteBookingLimit);

// ID-based routes (new preferred approach)
router.get('/:id', getBookingLimitById);
router.put('/:id', updateBookingLimitById);
router.delete('/:id', deleteBookingLimitById);

export default router;