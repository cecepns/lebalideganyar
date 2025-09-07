import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'booking_reservation',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const pool = mysql.createPool(dbConfig);

export const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    
    // Test if database exists and tables are created
    await connection.execute('SHOW TABLES');
    console.log('Database tables verified');
    
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    console.error('Please ensure:');
    console.error('1. MySQL server is running');
    console.error('2. Database "booking_reservation" exists');
    console.error('3. User has proper permissions');
    console.error('4. Environment variables are set correctly');
    
    // Don't exit the process, just log the error
    throw error;
  }
};