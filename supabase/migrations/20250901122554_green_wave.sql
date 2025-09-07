-- Create database
CREATE DATABASE IF NOT EXISTS booking_reservation;
USE booking_reservation;

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'super_admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME,
    service VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_booking_date (booking_date),
    INDEX idx_status (status)
);

-- Booking limits table to manage max bookings per date
CREATE TABLE IF NOT EXISTS booking_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    max_bookings INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO users (username, password, email, role) VALUES 
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Insert some sample booking limits
INSERT INTO booking_limits (date, max_bookings) VALUES 
(CURDATE(), 10),
(DATE_ADD(CURDATE(), INTERVAL 1 DAY), 8),
(DATE_ADD(CURDATE(), INTERVAL 2 DAY), 12)
ON DUPLICATE KEY UPDATE max_bookings = VALUES(max_bookings);

-- Insert some sample bookings for testing
INSERT INTO bookings (name, email, phone, booking_date, booking_time, service, price, notes, status) VALUES 
('John Doe', 'john@example.com', '+6281234567890', CURDATE(), '10:00:00', 'Bali Tour Package', 1500000, 'First booking', 'confirmed'),
('Jane Smith', 'jane@example.com', '+6281234567891', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', 'Airport Transfer', 500000, 'Second booking', 'pending'),
('Bob Johnson', 'bob@example.com', '+6281234567892', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', 'Bali Tour Package', 1500000, 'Third booking', 'confirmed'),
('Alice Brown', 'alice@example.com', '+6281234567893', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '11:00:00', 'Hotel Booking', 2000000, 'Fourth booking', 'completed'),
('Charlie Wilson', 'charlie@example.com', '+6281234567894', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '16:00:00', 'Airport Transfer', 500000, 'Fifth booking', 'cancelled')
ON DUPLICATE KEY UPDATE name = VALUES(name);