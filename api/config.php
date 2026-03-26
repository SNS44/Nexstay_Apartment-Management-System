<?php
/**
 * NexStay Database Configuration
 * Single source of truth for DB connection.
 * Tries port 3307 first (common XAMPP alt), then 3306.
 */

const DB_HOST    = 'localhost';
const DB_NAME    = 'nexstay';
const DB_USER    = 'root';
const DB_PASS    = '';
const DB_PORT    = 3307;
const DB_PORT_ALT = 3306;

function getDb(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $lastError = null;
    foreach ([DB_PORT, DB_PORT_ALT] as $port) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port={$port};dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::ATTR_TIMEOUT            => 2,
            ]);
            ensureSchema($pdo);
            return $pdo;
        } catch (PDOException $e) {
            $lastError = $e;
            if ($e->getCode() == 1045) break; // Wrong credentials - no point trying next port
        }
    }
    throw new Exception("Database connection failed: " . $lastError->getMessage(), (int)$lastError->getCode());
}

/**
 * Ensures required columns and tables exist.
 * Safe to run on every connection - uses IF NOT EXISTS / SHOW COLUMNS.
 */
function ensureSchema(PDO $pdo): void {
    try {
        // Ensure users.is_resident column exists
        $r = $pdo->query("SHOW COLUMNS FROM users LIKE 'is_resident'");
        if ($r->rowCount() === 0) {
            $pdo->exec("ALTER TABLE users ADD COLUMN is_resident TINYINT(1) DEFAULT 0 AFTER role");
        }

        // Ensure bookings.payment_status column exists
        $r = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'payment_status'");
        if ($r->rowCount() === 0) {
            $pdo->exec("ALTER TABLE bookings ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Pending' AFTER status");
        }

        // Ensure bookings.updated_at column exists
        $r = $pdo->query("SHOW COLUMNS FROM bookings LIKE 'updated_at'");
        if ($r->rowCount() === 0) {
            $pdo->exec("ALTER TABLE bookings ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
        }

        // Ensure user_activity table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS user_activity (
            id             INT AUTO_INCREMENT PRIMARY KEY,
            user_id        INT          NOT NULL,
            activity_type  VARCHAR(100) NOT NULL,
            reference_type VARCHAR(50),
            reference_id   INT,
            description    TEXT,
            created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Ensure payments table exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS payments (
            id               INT AUTO_INCREMENT PRIMARY KEY,
            user_id          INT            NOT NULL,
            booking_id       INT            NOT NULL,
            amount           DECIMAL(10,2)  NOT NULL,
            payment_method   VARCHAR(50)    DEFAULT 'UPI',
            payment_type     VARCHAR(50)    DEFAULT 'First_Month',
            transaction_id   VARCHAR(255),
            status           ENUM('Pending','Initiated','Success','Failed','Cancelled','Verified') DEFAULT 'Pending',
            notes            TEXT,
            admin_notes      TEXT,
            gateway_response TEXT,
            initiated_at     TIMESTAMP NULL,
            verified_at      TIMESTAMP NULL,
            completed_at     TIMESTAMP NULL,
            verified_by      INT NULL,
            created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX (user_id),
            INDEX (booking_id),
            INDEX (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        // Add any missing payments columns (for existing installations)
        $cols = $pdo->query("SHOW COLUMNS FROM payments")->fetchAll(PDO::FETCH_COLUMN);
        $addCols = [
            'payment_type'     => "ADD COLUMN payment_type VARCHAR(50) DEFAULT 'First_Month' AFTER payment_method",
            'gateway_response' => "ADD COLUMN gateway_response TEXT AFTER admin_notes",
            'initiated_at'     => "ADD COLUMN initiated_at TIMESTAMP NULL AFTER gateway_response",
            'completed_at'     => "ADD COLUMN completed_at TIMESTAMP NULL AFTER verified_at",
        ];
        foreach ($addCols as $col => $def) {
            if (!in_array($col, $cols, true)) {
                try { $pdo->exec("ALTER TABLE payments {$def}"); } catch (Exception $e) { /* ignore */ }
            }
        }

    } catch (Exception $e) {
        error_log("NexStay schema auto-fix error: " . $e->getMessage());
    }
}
