import { pool } from '../config/database.js';

export class Booking {
  static async getTableColumns() {
    try {
      const [columns] = await pool.execute('DESCRIBE bookings');
      return columns.map(col => col.Field);
    } catch (error) {
      return [];
    }
  }

  static async hasColumn(columnName) {
    const columns = await this.getTableColumns();
    return columns.includes(columnName);
  }
  static async create(bookingData) {
    try {
      const hasPrice = await this.hasColumn('price');
      const hasService = await this.hasColumn('service');
      const hasNotes = await this.hasColumn('notes');
      const hasStatus = await this.hasColumn('status');
      
      // Build dynamic query based on available columns
      let columns = ['name', 'email', 'phone', 'number_of_people', 'booking_date'];
      let values = [bookingData.name, bookingData.email, bookingData.phone, bookingData.number_of_people || 1, bookingData.date];
      
      if (bookingData.time) {
        columns.push('booking_time');
        values.push(bookingData.time);
      }
      
      if (hasService && bookingData.service) {
        columns.push('service');
        values.push(bookingData.service);
      }
      
      if (hasPrice) {
        columns.push('price');
        values.push(bookingData.price || 0);
      }
      
      if (hasNotes) {
        columns.push('notes');
        values.push(bookingData.notes || '');
      }
      
      if (hasStatus) {
        columns.push('status');
        values.push('pending');
      }
      
      const placeholders = values.map(() => '?').join(', ');
      const query = `INSERT INTO bookings (${columns.join(', ')}) VALUES (${placeholders})`;
      
      const [result] = await pool.execute(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;
      
      // Get total count for pagination metadata
      const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM bookings');
      const total = countResult[0].total;
      
      // Get paginated results
      const [rows] = await pool.execute(
        'SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [parseInt(limit), parseInt(offset)]
      );
      
      return {
        data: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Method to get all bookings without pagination (for backward compatibility)
  static async findAllNoPagination() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bookings ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bookings WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByDate(date) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM bookings WHERE booking_date = ?',
        [date]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, bookingData) {
    try {
      const hasPrice = await this.hasColumn('price');
      const hasService = await this.hasColumn('service');
      const hasNotes = await this.hasColumn('notes');
      const hasStatus = await this.hasColumn('status');
      
      // Build dynamic update query
      let setParts = ['name = ?', 'email = ?', 'phone = ?', 'number_of_people = ?', 'booking_date = ?'];
      let values = [bookingData.name, bookingData.email, bookingData.phone, bookingData.number_of_people || 1, bookingData.date];
      
      if (bookingData.time !== undefined) {
        setParts.push('booking_time = ?');
        values.push(bookingData.time);
      }
      
      if (hasService && bookingData.service !== undefined) {
        setParts.push('service = ?');
        values.push(bookingData.service);
      }
      
      if (hasPrice && bookingData.price !== undefined) {
        setParts.push('price = ?');
        values.push(bookingData.price || 0);
      }
      
      if (hasNotes && bookingData.notes !== undefined) {
        setParts.push('notes = ?');
        values.push(bookingData.notes);
      }
      
      if (hasStatus && bookingData.status !== undefined) {
        setParts.push('status = ?');
        values.push(bookingData.status);
      }
      
      values.push(id); // Add id for WHERE clause
      
      const query = `UPDATE bookings SET ${setParts.join(', ')} WHERE id = ?`;
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM bookings WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getStats() {
    try {
      const [totalRows] = await pool.execute('SELECT COUNT(*) as total FROM bookings');
      const [todayRows] = await pool.execute(
        'SELECT COUNT(*) as today FROM bookings WHERE DATE(booking_date) = CURDATE()'
      );
      const [pendingRows] = await pool.execute(
        'SELECT COUNT(*) as pending FROM bookings WHERE status = "pending"'
      );
      const [completedRows] = await pool.execute(
        'SELECT COUNT(*) as completed FROM bookings WHERE status = "completed"'
      );

      // Check if price column exists before trying to sum it
      let revenue = 0;
      try {
        const [revenueRows] = await pool.execute(
          'SELECT SUM(price) as revenue FROM bookings WHERE status = "completed"'
        );
        revenue = revenueRows[0].revenue || 0;
      } catch (priceError) {
        // Price column doesn't exist, use 0 as default
        if (priceError.code === 'ER_BAD_FIELD_ERROR') {
          revenue = 0;
        } else {
          throw priceError;
        }
      }

      return {
        totalBookings: totalRows[0].total,
        todayBookings: todayRows[0].today,
        pendingBookings: pendingRows[0].pending,
        completedBookings: completedRows[0].completed,
        revenue: revenue
      };
    } catch (error) {
      throw error;
    }
  }

  static async getBookingCountsByDates(dates) {
    try {
      if (dates.length === 0) return {};
      
      const placeholders = dates.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT booking_date, COUNT(*) as count FROM bookings WHERE booking_date IN (${placeholders}) GROUP BY booking_date`,
        dates
      );
      
      const countMap = {};
      rows.forEach(row => {
        countMap[row.booking_date] = row.count;
      });
      
      return countMap;
    } catch (error) {
      throw error;
    }
  }
}