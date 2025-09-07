const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();
const PORT =
  typeof process !== "undefined" && process.env.PORT ? process.env.PORT : 3001;

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "booking_reservation",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// BOOKINGS
class Booking {
  static async getTableColumns() {
    try {
      const [columns] = await pool.execute("DESCRIBE bookings");
      return columns.map((col) => col.Field);
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
      const hasPrice = await this.hasColumn("price");
      const hasService = await this.hasColumn("service");
      const hasNotes = await this.hasColumn("notes");
      const hasStatus = await this.hasColumn("status");

      // Build dynamic query based on available columns
      let columns = [
        "name",
        "email",
        "phone",
        "number_of_people",
        "booking_date",
      ];
      let values = [
        bookingData.name,
        bookingData.email,
        bookingData.phone,
        bookingData.number_of_people || 1,
        bookingData.date,
      ];

      if (bookingData.time) {
        columns.push("booking_time");
        values.push(bookingData.time);
      }

      if (hasService && bookingData.service) {
        columns.push("service");
        values.push(bookingData.service);
      }

      if (hasPrice) {
        columns.push("price");
        values.push(bookingData.price || 0);
      }

      if (hasNotes) {
        columns.push("notes");
        values.push(bookingData.notes || "");
      }

      if (hasStatus) {
        columns.push("status");
        values.push("pending");
      }

      const placeholders = values.map(() => "?").join(", ");
      const query = `INSERT INTO bookings (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;

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
      const [countResult] = await pool.execute(
        "SELECT COUNT(*) as total FROM bookings"
      );
      const total = countResult[0].total;

      // Get paginated results
      const [rows] = await pool.execute(
        "SELECT * FROM bookings ORDER BY created_at DESC LIMIT ? OFFSET ?",
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
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Method to get all bookings without pagination (for backward compatibility)
  static async findAllNoPagination() {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM bookings ORDER BY created_at DESC"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM bookings WHERE id = ?", [
        id,
      ]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByDate(date) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM bookings WHERE booking_date = ?",
        [date]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, bookingData) {
    try {
      const hasPrice = await this.hasColumn("price");
      const hasService = await this.hasColumn("service");
      const hasNotes = await this.hasColumn("notes");
      const hasStatus = await this.hasColumn("status");

      // Build dynamic update query
      let setParts = [
        "name = ?",
        "email = ?",
        "phone = ?",
        "number_of_people = ?",
        "booking_date = ?",
      ];
      let values = [
        bookingData.name,
        bookingData.email,
        bookingData.phone,
        bookingData.number_of_people || 1,
        bookingData.date,
      ];

      if (bookingData.time !== undefined) {
        setParts.push("booking_time = ?");
        values.push(bookingData.time);
      }

      if (hasService && bookingData.service !== undefined) {
        setParts.push("service = ?");
        values.push(bookingData.service);
      }

      if (hasPrice && bookingData.price !== undefined) {
        setParts.push("price = ?");
        values.push(bookingData.price || 0);
      }

      if (hasNotes && bookingData.notes !== undefined) {
        setParts.push("notes = ?");
        values.push(bookingData.notes);
      }

      if (hasStatus && bookingData.status !== undefined) {
        setParts.push("status = ?");
        values.push(bookingData.status);
      }

      values.push(id); // Add id for WHERE clause

      const query = `UPDATE bookings SET ${setParts.join(", ")} WHERE id = ?`;
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute("DELETE FROM bookings WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getStats() {
    try {
      const [totalRows] = await pool.execute(
        "SELECT COUNT(*) as total FROM bookings"
      );
      const [todayRows] = await pool.execute(
        "SELECT COUNT(*) as today FROM bookings WHERE DATE(booking_date) = CURDATE()"
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
        if (priceError.code === "ER_BAD_FIELD_ERROR") {
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
        revenue: revenue,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getBookingCountsByDates(dates) {
    try {
      if (dates.length === 0) return {};

      const placeholders = dates.map(() => "?").join(",");
      const [rows] = await pool.execute(
        `SELECT booking_date, COUNT(*) as count FROM bookings WHERE booking_date IN (${placeholders}) GROUP BY booking_date`,
        dates
      );

      const countMap = {};
      rows.forEach((row) => {
        countMap[row.booking_date] = row.count;
      });

      return countMap;
    } catch (error) {
      throw error;
    }
  }
}

class BookingLimit {
  static async create(date, maxBookings) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO booking_limits (date, max_bookings) VALUES (?, ?) ON DUPLICATE KEY UPDATE max_bookings = ?",
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
        "SELECT * FROM booking_limits WHERE date = ?",
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
        "SELECT * FROM booking_limits ORDER BY date ASC"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(date, maxBookings) {
    try {
      const [result] = await pool.execute(
        "UPDATE booking_limits SET max_bookings = ? WHERE date = ?",
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
        "DELETE FROM booking_limits WHERE date = ?",
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
        "SELECT * FROM booking_limits WHERE id = ?",
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
        "UPDATE booking_limits SET max_bookings = ? WHERE id = ?",
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
        "DELETE FROM booking_limits WHERE id = ?",
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

      const placeholders = dates.map(() => "?").join(",");
      const [rows] = await pool.execute(
        `SELECT date, max_bookings FROM booking_limits WHERE DATE(date) IN (${placeholders})`,
        dates
      );

      const limitMap = {};
      rows.forEach((row) => {
        // Convert the database date to YYYY-MM-DD format for consistent mapping
        const dateKey = new Date(row.date).toISOString().split("T")[0];
        limitMap[dateKey] = { max_bookings: row.max_bookings };
      });

      return limitMap;
    } catch (error) {
      throw error;
    }
  }
}

class User {
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await pool.execute(
        "INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)",
        [
          userData.username,
          hashedPassword,
          userData.email,
          userData.role || "admin",
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

// USERS
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await User.validatePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// BOOKINGS
const createBooking = async (req, res) => {
  try {
    const bookingId = await Booking.create(req.body);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: { id: bookingId },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(Math.max(1, parseInt(limit)), 100); // Max 100 items per page

    const result = await Booking.findAll({ page: pageNum, limit: limitNum });

    // Transform data to match frontend expectations
    const transformedBookings = result.data.map((booking) => ({
      ...booking,
      date: booking.booking_date, // Map booking_date to date for frontend
      time: booking.booking_time, // Map booking_time to time for frontend
    }));

    res.json({
      success: true,
      data: transformedBookings,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const bookings = await Booking.findByDate(date);
    res.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings by date error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Booking.update(id, req.body);

    if (updated) {
      res.json({
        success: true,
        message: "Booking updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: "Booking deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await Booking.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to fetch dashboard stats";
    if (error.code === "ECONNREFUSED") {
      errorMessage =
        "Database connection refused. Please check if MySQL server is running.";
    } else if (error.code === "ER_BAD_DB_ERROR") {
      errorMessage =
        "Database does not exist. Please create the booking_reservation database.";
    } else if (error.code === "ER_NO_SUCH_TABLE") {
      errorMessage =
        "Required tables do not exist. Please run the database migration.";
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      errorMessage = "Database access denied. Please check your credentials.";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error:
        process?.env?.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getBookingStatus = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const statusMap = {};

    // Get all dates to check
    const dates = [];
    for (let i = 0; i < parseInt(days); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
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
        statusMap[dateStr] = "blocked"; // Red - date blocked
      } else if (bookingCount >= maxBookings) {
        statusMap[dateStr] = "full"; // Red - fully booked
      } else if (bookingCount >= maxBookings * 0.8) {
        statusMap[dateStr] = "almost-full"; // Yellow - almost full
      } else {
        statusMap[dateStr] = "available"; // Green/Gray - available
      }
    }

    res.json({
      success: true,
      data: statusMap,
    });
  } catch (error) {
    console.error("Get booking status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking status",
    });
  }
};

// BOOKING LIMITS
const setBookingLimit = async (req, res) => {
  try {
    const { date, maxBookings } = req.body;
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split("T")[0];
    await BookingLimit.create(normalizedDate, maxBookings);

    res.json({
      success: true,
      message: "Booking limit set successfully",
    });
  } catch (error) {
    console.error("Set booking limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set booking limit",
    });
  }
};

const getBookingLimit = async (req, res) => {
  try {
    const { date } = req.params;
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split("T")[0];
    const limit = await BookingLimit.findByDate(normalizedDate);

    res.json({
      success: true,
      data: limit || { maxBookings: 10 }, // Default limit
    });
  } catch (error) {
    console.error("Get booking limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking limit",
    });
  }
};

const getAllBookingLimits = async (req, res) => {
  try {
    const limits = await BookingLimit.findAll();
    res.json({
      success: true,
      data: limits,
    });
  } catch (error) {
    console.error("Get all booking limits error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking limits",
    });
  }
};

const updateBookingLimit = async (req, res) => {
  try {
    const { date } = req.params;
    const { maxBookings } = req.body;
    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split("T")[0];
    const updated = await BookingLimit.update(normalizedDate, maxBookings);

    if (updated) {
      res.json({
        success: true,
        message: "Booking limit updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }
  } catch (error) {
    console.error("Update booking limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking limit",
    });
  }
};

const deleteBookingLimit = async (req, res) => {
  try {
    const { date } = req.params;

    // Normalize date format to YYYY-MM-DD
    const normalizedDate = new Date(date).toISOString().split("T")[0];
    console.log("Deleting booking limit for date:", normalizedDate);

    // First check if the limit exists
    const existing = await BookingLimit.findByDate(normalizedDate);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }

    const deleted = await BookingLimit.delete(normalizedDate);

    if (deleted) {
      res.json({
        success: true,
        message: "Booking limit deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }
  } catch (error) {
    console.error("Delete booking limit error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking limit",
    });
  }
};

// ID-based functions (preferred approach)
const getBookingLimitById = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = await BookingLimit.findById(id);

    if (!limit) {
      return res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }

    res.json({
      success: true,
      data: limit,
    });
  } catch (error) {
    console.error("Get booking limit by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking limit",
    });
  }
};

const updateBookingLimitById = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxBookings } = req.body;

    // First check if the limit exists
    const existing = await BookingLimit.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }

    const updated = await BookingLimit.updateById(id, maxBookings);

    if (updated) {
      res.json({
        success: true,
        message: "Booking limit updated successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }
  } catch (error) {
    console.error("Update booking limit by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update booking limit",
    });
  }
};

const deleteBookingLimitById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Deleting booking limit with ID:", id);

    // First check if the limit exists
    const existing = await BookingLimit.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }

    const deleted = await BookingLimit.deleteById(id);

    if (deleted) {
      res.json({
        success: true,
        message: "Booking limit deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Booking limit not found",
      });
    }
  } catch (error) {
    console.error("Delete booking limit by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete booking limit",
    });
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post("/api/auth/login", login);
// app.use('/api/bookings', bookingRoutes);
app.post("/api/bookings", createBooking);
app.get("/api/bookings", getBookings);
app.get("/api/bookings/status", getBookingStatus);
app.get("/api/bookings/date/:date", getBookingsByDate);
app.put("/api/bookings/:id", updateBooking);
app.delete("/api/bookings/:id", deleteBooking);

// app.use('/api/booking-limits', bookingLimitRoutes);
app.post("/api/booking-limits", setBookingLimit);
app.get("/api/booking-limits", getAllBookingLimits);
app.get("/api/booking-limits/date/:date", getBookingLimit);
app.put("/api/booking-limits/date/:date", updateBookingLimit);
app.delete("/api/booking-limits/date/:date", deleteBookingLimit);

// ID-based routes (new preferred approach)
app.get("/api/booking-limits/:id", getBookingLimitById);
app.put("/api/booking-limits/:id", updateBookingLimitById);
app.delete("/api/booking-limits/:id", deleteBookingLimitById);

// app.use('/api/dashboard', dashboardRoutes);
app.get("/api/dashboard/stats", getDashboardStats);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
// const startServer = async () => {
//   try {
//     await connectDB();
//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT}`);
//       console.log(`API available at: http://localhost:${PORT}/api`);
//     });
//   } catch (error) {
//     console.error('Failed to connect to database:', error.message);
//     console.log('Starting server without database connection...');
//     console.log('Some features may not work until database is properly configured.');

//     app.listen(PORT, () => {
//       console.log(`Server is running on port ${PORT} (database connection failed)`);
//       console.log(`API available at: http://localhost:${PORT}/api`);
//     });
//   }
// };

// startServer();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});
