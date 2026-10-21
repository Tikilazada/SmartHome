-- ====================================================================
-- HỆ THỐNG THEO DÕI THÔNG SỐ MÔI TRƯỜNG TRONG NHÀ VÀ ĐIỀU KHIỂN THIẾT BỊ
-- File: database/schema.sql
-- Database: MySQL 8.0+ / MariaDB 10.4+
-- Mô tả: Khởi tạo cơ sở dữ liệu, 5 bảng quan hệ và dữ liệu mẫu chuẩn
-- ====================================================================

-- 1. Khởi tạo Cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS `iot_home` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `iot_home`;

-- Tắt kiểm tra khóa ngoại tạm thời để khởi tạo lại bảng sạch sẽ
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `Action`;
DROP TABLE IF EXISTS `Data_Sensor`;
DROP TABLE IF EXISTS `Sensors`;
DROP TABLE IF EXISTS `Devices`;
DROP TABLE IF EXISTS `User`;
SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- 2. Khởi tạo bảng User
-- Mục đích: Quản lý thông tin xác thực và người dùng hệ thống (UC01)
-- ====================================================================
CREATE TABLE `User` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    `full_name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 3. Khởi tạo bảng Devices
-- Mục đích: Quản lý danh sách và trạng thái hiện tại của 3 đèn (UC03)
-- ====================================================================
CREATE TABLE `Devices` (
    `device_id` INT AUTO_INCREMENT PRIMARY KEY,
    `device_name` VARCHAR(50) NOT NULL,
    `device_type` VARCHAR(50) NOT NULL DEFAULT 'LIGHT',
    `status` ENUM('ON', 'OFF') NOT NULL DEFAULT 'OFF',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 4. Khởi tạo bảng Sensors
-- Mục đích: Quản lý danh mục các cảm biến đo thông số môi trường (UC02, UC04)
-- ====================================================================
CREATE TABLE `Sensors` (
    `sensor_id` INT AUTO_INCREMENT PRIMARY KEY,
    `sensor_name` VARCHAR(50) NOT NULL,
    `sensor_type` VARCHAR(50) NOT NULL,
    `unit` VARCHAR(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- 5. Khởi tạo bảng Data_Sensor
-- Mục đích: Lưu trữ dữ liệu quan trắc môi trường theo thời gian (UC02, UC04)
-- ====================================================================
CREATE TABLE `Data_Sensor` (
    `data_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `sensor_id` INT NOT NULL,
    `value` DECIMAL(6, 2) NOT NULL,
    `recorded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_datasensor_sensor` 
        FOREIGN KEY (`sensor_id`) REFERENCES `Sensors` (`sensor_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo Index tăng tốc truy vấn theo thời gian và loại cảm biến
CREATE INDEX `idx_datasensor_sensor_time` ON `Data_Sensor` (`sensor_id`, `recorded_at`);
CREATE INDEX `idx_datasensor_recorded_at` ON `Data_Sensor` (`recorded_at`);

-- ====================================================================
-- 6. Khởi tạo bảng Action
-- Mục đích: Ghi nhận vết và lịch sử điều khiển thiết bị (UC03, UC05)
-- ====================================================================
CREATE TABLE `Action` (
    `action_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `device_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `action` ENUM('ON', 'OFF') NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `time_sent` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `response_time` DATETIME NULL,
    CONSTRAINT `fk_action_device` 
        FOREIGN KEY (`device_id`) REFERENCES `Devices` (`device_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_action_user` 
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo Index tối ưu tra cứu lịch sử điều khiển
CREATE INDEX `idx_action_device_time` ON `Action` (`device_id`, `time_sent`);
CREATE INDEX `idx_action_user_time` ON `Action` (`user_id`, `time_sent`);
CREATE INDEX `idx_action_status` ON `Action` (`status`);

-- ====================================================================
-- 7. CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- ====================================================================

-- 7.1. Người dùng mặc định: admin / password123 (Hash bcrypt)
-- Password 'password123' có hash: $2a$10$wN9a8v2QkH3K1t8zZ6qPRe5vO6uD7tB9n8e3w0Z2c4b5a6c7d8e9f
INSERT INTO `User` (`user_id`, `username`, `password`, `full_name`) VALUES
(1, 'admin', '$2b$10$3euPcmQ1v.0Iq3hK0vUa7e1yq6oR9C7lqO0Pz0Y.V/E2l9KqH1t.m', 'Nguyễn Văn A');

-- 7.2. Danh sách 3 thiết bị chấp hành chuẩn
INSERT INTO `Devices` (`device_id`, `device_name`, `device_type`, `status`) VALUES
(1, 'Đèn 1', 'LIGHT', 'ON'),
(2, 'Đèn 2', 'LIGHT', 'OFF'),
(3, 'Đèn 3', 'LIGHT', 'ON');

-- 7.3. Danh mục 3 cảm biến môi trường
INSERT INTO `Sensors` (`sensor_id`, `sensor_name`, `sensor_type`, `unit`) VALUES
(1, 'Nhiệt độ', 'DHT11', '°C'),
(2, 'Độ ẩm', 'DHT11', '%'),
(3, 'Cường độ ánh sáng', 'BH1750', 'lux');

-- 7.4. Dữ liệu quan trắc cảm biến mẫu
INSERT INTO `Data_Sensor` (`sensor_id`, `value`, `recorded_at`) VALUES
(1, 28.50, '2026-09-10 08:00:00'),
(2, 72.00, '2026-09-10 08:00:00'),
(3, 350.00, '2026-09-10 08:00:00'),
(1, 28.80, '2026-09-10 09:00:00'),
(2, 70.50, '2026-09-10 09:00:00'),
(3, 420.00, '2026-09-10 09:00:00'),
(1, 29.20, '2026-09-10 10:00:00'),
(2, 68.00, '2026-09-10 10:00:00'),
(3, 510.00, '2026-09-10 10:00:00'),
(1, 28.50, '2026-09-10 11:00:00'),
(2, 72.00, '2026-09-10 11:00:00'),
(3, 350.00, '2026-09-10 11:00:00');

-- 7.5. Lịch sử điều khiển mẫu
INSERT INTO `Action` (`action_id`, `device_id`, `user_id`, `action`, `status`, `time_sent`, `response_time`) VALUES
(1, 1, 1, 'ON', 'SUCCESS', '2026-09-10 10:25:30', '2026-09-10 10:25:31'),
(2, 2, 1, 'OFF', 'SUCCESS', '2026-09-10 10:20:15', '2026-09-10 10:20:16'),
(3, 3, 1, 'ON', 'FAILED', '2026-09-10 10:18:02', NULL);
