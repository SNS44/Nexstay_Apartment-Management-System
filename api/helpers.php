<?php

require_once __DIR__ . '/config.php';

function startSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        $lifetime = 86400 * 30; // 30 days
        ini_set('session.gc_maxlifetime', $lifetime);
        ini_set('session.cookie_lifetime', $lifetime);
        
        session_set_cookie_params([
            'lifetime' => $lifetime,
            'path' => '/',
            'domain' => '',
            'secure' => false, 
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        
        session_start();
    }
}

function sendJson($data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($data);
    exit;
}

function sendError(string $message, int $statusCode = 400, array $extra = []): void
{
    sendJson(array_merge(['success' => false, 'message' => $message], $extra), $statusCode);
}

function requireMethod(string $method): void
{
    if (strtoupper($_SERVER['REQUEST_METHOD']) !== strtoupper($method)) {
        sendError('Method not allowed', 405);
    }
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        sendError('Invalid JSON body', 400);
    }
    return $data;
}

function requireLogin(): array
{
    startSession();
    if (empty($_SESSION['user_id'])) {
        sendError('Authentication required', 401);
    }

    return [
        'id' => (int)$_SESSION['user_id'],
        'role' => $_SESSION['role'] ?? 'user',
    ];
}

function requireAdmin(): array
{
    $user = requireLogin();
    if (strtolower($user['role'] ?? 'user') !== 'admin') {
        sendError('Admin access required', 403);
    }
    return $user;
}

function recordActivity(int $userId, string $type, ?string $refType, ?int $refId, ?string $description = null): void
{
    $pdo = getDb();
    $stmt = $pdo->prepare('INSERT INTO user_activity (user_id, activity_type, reference_type, reference_id, description) VALUES (?,?,?,?,?)');
    $stmt->execute([$userId, $type, $refType, $refId, $description]);
}

function refreshResidentFlag(int $userId): void
{
    $pdo = getDb();
    
    // Check for Active bookings
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM bookings 
        WHERE user_id = ? 
          AND status = 'Active'");
    $stmt->execute([$userId]);
    $hasActive = $stmt->fetchColumn() > 0;

    $stmt = $pdo->prepare('UPDATE users SET is_resident = ? WHERE id = ?');
    $stmt->execute([$hasActive ? 1 : 0, $userId]);
}

/**
 * Auto-expire approved bookings that have not been paid within 24 hours.
 * Called on relevant API endpoints.
 */
function expireStaleBookings(): void
{
    $pdo = getDb();
    try {
        // Find all Approved bookings older than 24 hours that have no successful payment
        $stmt = $pdo->query("SELECT b.id, b.room_id, b.user_id FROM bookings b
            WHERE b.status = 'Approved'
              AND b.created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
              AND NOT EXISTS (
                  SELECT 1 FROM payments p WHERE p.booking_id = b.id AND p.status IN ('Success', 'Verified')
              )");
        $staleBookings = $stmt->fetchAll();

        foreach ($staleBookings as $booking) {
            $pdo->beginTransaction();
            try {
                // Expire the booking
                $stmt = $pdo->prepare("UPDATE bookings SET status = 'Expired' WHERE id = ? AND status = 'Approved'");
                $stmt->execute([$booking['id']]);

                if ($stmt->rowCount() > 0) {
                    // Cancel pending payments
                    $stmt = $pdo->prepare("UPDATE payments SET status = 'Cancelled' WHERE booking_id = ? AND status IN ('Pending', 'Initiated')");
                    $stmt->execute([$booking['id']]);

                    // Release room back to Available
                    $stmt = $pdo->prepare("UPDATE rooms SET status = 'Available' WHERE id = ? AND status = 'Booked'");
                    $stmt->execute([$booking['room_id']]);

                    recordActivity($booking['user_id'], 'booking_expired', 'booking', $booking['id'],
                        "Booking #{$booking['id']} expired due to non-payment within 24 hours.");
                }

                $pdo->commit();
            } catch (Exception $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                error_log("Failed to expire booking #{$booking['id']}: " . $e->getMessage());
            }
        }
    } catch (Exception $e) {
        error_log("Expire stale bookings error: " . $e->getMessage());
    }
}
