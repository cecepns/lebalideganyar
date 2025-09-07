import { pool } from '../config/database.js';

export class BookingLimit {
  static async create(date, maxBookings) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO booking_limits (date, max_bookings) VALUES (?, ?) ON DUPLICATE KEY UPDATE max_bookings = ?',
        [date, maxBookings, maxBookings]
      );
      return result.insertId || result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async findByDate(date) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM booking_limits WHERE date = ?',
        [date]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM booking_limits ORDER BY date ASC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(date, maxBookings) {
    try {
      const [result] = await pool.execute(
        'UPDATE booking_limits SET max_bookings = ? WHERE date = ?',
        [maxBookings, date]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(date) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM booking_limits WHERE date = ?',
        [date]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // ID-based methods for better API design
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM booking_limits WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, maxBookings) {
    try {
      const [result] = await pool.execute(
        'UPDATE booking_limits SET max_bookings = ? WHERE id = ?',
        [maxBookings, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM booking_limits WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getLimitsByDates(dates) {
    try {
      if (dates.length === 0) return {};
      
      const placeholders = dates.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT date, max_bookings FROM booking_limits WHERE DATE(date) IN (${placeholders})`,
        dates
      );
      
      const limitMap = {};
      rows.forEach(row => {
        // Convert the database date to YYYY-MM-DD format for consistent mapping
        const dateKey = new Date(row.date).toISOString().split('T')[0];
        limitMap[dateKey] = { max_bookings: row.max_bookings };
      });
      
      return limitMap;
    } catch (error) {
      throw error;
    }
  }
}