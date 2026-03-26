-- ============================================================
--  NexStay – Apartment Management System
-- ============================================================

CREATE DATABASE IF NOT EXISTS nexstay
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nexstay;

-- ── 1. USERS ────────────────────────────────────────────────
CREATE TABLE users (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone        VARCHAR(20)  DEFAULT NULL,
    password     VARCHAR(255) NOT NULL,
    role         ENUM('user','admin') DEFAULT 'user',
    is_active    TINYINT(1)   DEFAULT 1,
    is_resident  TINYINT(1)   DEFAULT 0,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 2. FLOORS ───────────────────────────────────────────────
CREATE TABLE floors (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    floor_number INT          NOT NULL UNIQUE,
    name         VARCHAR(100) NOT NULL,
    description  TEXT         DEFAULT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 3. ROOMS ────────────────────────────────────────────────
CREATE TABLE rooms (
    id            INT           AUTO_INCREMENT PRIMARY KEY,
    room_number   VARCHAR(50)   NOT NULL UNIQUE,
    floor_id      INT           NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    description   TEXT          DEFAULT NULL,
    image_path    VARCHAR(500)  DEFAULT NULL,
    status        ENUM('Available','Booked','Occupied','Maintenance','Inactive') DEFAULT 'Available',
    resident_id   INT           DEFAULT NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (floor_id)    REFERENCES floors(id) ON DELETE CASCADE,
    FOREIGN KEY (resident_id) REFERENCES users(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 4. BOOKINGS ─────────────────────────────────────────────
CREATE TABLE bookings (
    id               INT           AUTO_INCREMENT PRIMARY KEY,
    user_id          INT           NOT NULL,
    room_id          INT           NOT NULL,
    move_in_date     DATE          NOT NULL,
    duration_months  INT           DEFAULT 1,
    monthly_amount   DECIMAL(10,2) NOT NULL,
    total_amount     DECIMAL(10,2) NOT NULL,
    additional_notes TEXT          DEFAULT NULL,
    status           ENUM('Pending','Approved','Rejected','Active','Completed','Cancelled','Expired','Archived') DEFAULT 'Pending',
    payment_status   VARCHAR(50)   DEFAULT 'Pending',
    approved_by      INT           DEFAULT NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)     REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 5. PAYMENTS ─────────────────────────────────────────────
CREATE TABLE payments (
    id               INT           AUTO_INCREMENT PRIMARY KEY,
    user_id          INT           NOT NULL,
    booking_id       INT           NOT NULL,
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   VARCHAR(50)   DEFAULT 'UPI',
    payment_type     VARCHAR(50)   DEFAULT 'First_Month',
    transaction_id   VARCHAR(255)  DEFAULT NULL,
    status           ENUM('Pending','Initiated','Success','Failed','Cancelled','Verified') DEFAULT 'Pending',
    notes            TEXT          DEFAULT NULL,
    admin_notes      TEXT          DEFAULT NULL,
    gateway_response TEXT          DEFAULT NULL,
    initiated_at     TIMESTAMP     NULL DEFAULT NULL,
    verified_at      TIMESTAMP     NULL DEFAULT NULL,
    completed_at     TIMESTAMP     NULL DEFAULT NULL,
    verified_by      INT           DEFAULT NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user    (user_id),
    INDEX idx_booking (booking_id),
    INDEX idx_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 6. SERVICE REQUESTS ─────────────────────────────────────
CREATE TABLE service_requests (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    room_id      INT          NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description  TEXT         NOT NULL,
    priority     ENUM('Normal','High','Urgent') DEFAULT 'Normal',
    status       ENUM('Pending','Assigned','In_Progress','Completed','Cancelled') DEFAULT 'Pending',
    admin_notes  TEXT         DEFAULT NULL,
    completed_at TIMESTAMP    NULL DEFAULT NULL,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 7. USER ACTIVITY ────────────────────────────────────────
CREATE TABLE user_activity (
    id             INT          AUTO_INCREMENT PRIMARY KEY,
    user_id        INT          NOT NULL,
    activity_type  VARCHAR(100) NOT NULL,
    reference_type VARCHAR(50)  DEFAULT NULL,
    reference_id   INT          DEFAULT NULL,
    description    TEXT         DEFAULT NULL,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 8. BOOKING AUDIT LOG ────────────────────────────────────
CREATE TABLE booking_audit_log (
    id         INT          AUTO_INCREMENT PRIMARY KEY,
    booking_id INT          NOT NULL,
    user_id    INT          NOT NULL,
    action_by  INT          DEFAULT NULL,
    action     VARCHAR(100) DEFAULT NULL,
    old_status VARCHAR(50)  DEFAULT NULL,
    new_status VARCHAR(50)  DEFAULT NULL,
    notes      TEXT         DEFAULT NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_booking (booking_id),
    INDEX idx_user    (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  SEED DATA
-- ============================================================

INSERT INTO floors (floor_number, name, description) VALUES
(1, 'First Floor',  'Ground level – 3 residential rooms'),
(2, 'Second Floor', '3 residential rooms'),
(3, 'Third Floor',  '3 residential rooms'),
(4, 'Fourth Floor', '3 residential rooms'),
(5, 'Fifth Floor',  '3 premium rooms with terrace access');

INSERT INTO rooms (room_number, floor_id, monthly_price, description, image_path, status) VALUES
('101', 1, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('102', 1, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('103', 1, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('201', 2, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('202', 2, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('203', 2, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('301', 3, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('302', 3, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('303', 3, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('401', 4, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('402', 4, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('403', 4, 15000.00, 'WiFi, AC, TV, Attached Bathroom', 'Upload/Room.png', 'Available'),
('501', 5, 18000.00, 'WiFi, AC, TV, Attached Bathroom, Terrace Access', 'Upload/Room.png', 'Available'),
('502', 5, 18000.00, 'WiFi, AC, TV, Attached Bathroom, Terrace Access', 'Upload/Room.png', 'Available'),
('503', 5, 18000.00, 'WiFi, AC, TV, Attached Bathroom, Terrace Access', 'Upload/Room.png', 'Available');